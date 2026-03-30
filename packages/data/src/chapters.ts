import { ObjectId, type Db, type Filter, type InsertManyResult } from 'mongodb';
import type {
	ChapterDocument,
	ChapterInsert,
	ChapterKind,
	ChapterProcessingStatus,
} from './types';

const COLLECTION = 'chapters';

function col(db: Db) {
	return db.collection<ChapterDocument>(COLLECTION);
}

export async function getChaptersByBookId(db: Db, bookId: string): Promise<ChapterDocument[]> {
	return col(db)
		.find({ bookId: new ObjectId(bookId) })
		.sort({ chapterIndex: 1 })
		.toArray();
}

export async function getChapterById(db: Db, chapterId: string): Promise<ChapterDocument | null> {
	return col(db).findOne({ _id: new ObjectId(chapterId) });
}

/**
 * Inserts multiple chapter documents and returns the InsertManyResult
 * so callers can access insertedIds.
 */
export async function insertManyChapters(
	db: Db,
	chapters: ChapterInsert[],
): Promise<InsertManyResult> {
	return col(db).insertMany(chapters as ChapterDocument[]);
}

export interface UpdateChapterStatusOptions {
	/** When set, updates the chapter `failed` flag together with `processingStatus`. */
	failed?: boolean;
}

/** Fields produced by XHTML extract / classification (persisted before status becomes `completed`). */
export interface ChapterExtractFields {
	chapterKind: ChapterKind;
	title: string;
	chapterTextCharCount: number;
	chapterTextWordCount: number;
	textPreview: string;
}

export async function updateChapterStatus(
	db: Db,
	chapterId: string,
	status: ChapterProcessingStatus,
	options?: UpdateChapterStatusOptions,
): Promise<void> {
	const $set: Record<string, unknown> = {
		processingStatus: status,
		updatedAt: new Date(),
	};
	if (options?.failed !== undefined) {
		$set.failed = options.failed;
	}
	await col(db).updateOne(
		{ _id: new ObjectId(chapterId) },
		{ $set },
	);
}

export async function setChapterPipelineId(
	db: Db,
	chapterId: string,
	pipelineId: string,
): Promise<void> {
	await col(db).updateOne(
		{ _id: new ObjectId(chapterId) },
		{
			$set: {
				pipelineId,
				updatedAt: new Date(),
			},
		},
	);
}

export async function updateChapterExtractFields(
	db: Db,
	chapterId: string,
	fields: ChapterExtractFields,
): Promise<void> {
	await col(db).updateOne(
		{ _id: new ObjectId(chapterId) },
		{
			$set: {
				chapterKind: fields.chapterKind,
				title: fields.title,
				chapterTextCharCount: fields.chapterTextCharCount,
				chapterTextWordCount: fields.chapterTextWordCount,
				textPreview: fields.textPreview,
				updatedAt: new Date(),
			},
		},
	);
}

/** Marks chapter processing as finished after extract fields are already stored. */
export async function completeChapterProcessing(db: Db, chapterId: string): Promise<void> {
	await col(db).updateOne(
		{ _id: new ObjectId(chapterId) },
		{
			$set: {
				processingStatus: 'completed',
				failed: false,
				updatedAt: new Date(),
			},
		},
	);
}

export async function updateChapterSummary(
	db: Db,
	chapterId: string,
	summary: string,
): Promise<void> {
	await col(db).updateOne(
		{ _id: new ObjectId(chapterId) },
		{
			$set: {
				summary,
				updatedAt: new Date(),
			},
		},
	);
}

export async function countChaptersByStatus(
	db: Db,
	bookId: string,
): Promise<{ total: number; completed: number; failed: number }> {
	const c = col(db);
	const bookOid = new ObjectId(bookId);

	const failedFilter = {
		bookId: bookOid,
		$or: [
			{ failed: true },
			// Legacy: chapters stored with processingStatus "failed" before `failed` flag existed
			{ processingStatus: 'failed' },
		],
	} as Filter<ChapterDocument>;

	const [total, completed, failed] = await Promise.all([
		c.countDocuments({ bookId: bookOid }),
		c.countDocuments({ bookId: bookOid, processingStatus: 'completed' }),
		c.countDocuments(failedFilter),
	]);

	return { total, completed, failed };
}

export async function getPendingChapters(
	db: Db,
	bookId: string,
	startIndex: number,
	limit: number,
): Promise<ChapterDocument[]> {
	const pendingOrRetryFilter = {
		bookId: new ObjectId(bookId),
		chapterIndex: { $gte: startIndex },
		$or: [
			{ processingStatus: 'pending' },
			{ failed: true },
			// Legacy rows
			{ processingStatus: 'failed' },
		],
	} as Filter<ChapterDocument>;

	return col(db)
		.find(pendingOrRetryFilter)
		.sort({ chapterIndex: 1 })
		.limit(limit)
		.toArray();
}

export async function deleteChaptersByBookId(db: Db, bookId: string): Promise<void> {
	await col(db).deleteMany({ bookId: new ObjectId(bookId) });
}
