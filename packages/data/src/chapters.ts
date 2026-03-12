import { ObjectId, type Db, type InsertManyResult } from 'mongodb';
import type { ChapterDocument, ChapterInsert, ChapterProcessingStatus } from './types';

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

export async function updateChapterStatus(
	db: Db,
	chapterId: string,
	status: ChapterProcessingStatus,
): Promise<void> {
	await col(db).updateOne(
		{ _id: new ObjectId(chapterId) },
		{
			$set: {
				processingStatus: status,
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

	const [total, completed, failed] = await Promise.all([
		c.countDocuments({ bookId: bookOid }),
		c.countDocuments({ bookId: bookOid, processingStatus: 'completed' }),
		c.countDocuments({ bookId: bookOid, processingStatus: 'failed' }),
	]);

	return { total, completed, failed };
}

export async function getPendingChapters(
	db: Db,
	bookId: string,
	startIndex: number,
	limit: number,
): Promise<ChapterDocument[]> {
	return col(db)
		.find({
			bookId: new ObjectId(bookId),
			chapterIndex: { $gte: startIndex },
			processingStatus: { $in: ['pending', 'failed'] },
		})
		.sort({ chapterIndex: 1 })
		.limit(limit)
		.toArray();
}
