import { ObjectId } from 'mongodb';
import { getDb } from '../mongodb';
import type { ChapterDocument, ChapterInsert } from '../types/chapter';
import type { ChapterProcessingStatus } from '../types/processing';

async function collection() {
	const db = await getDb();
	return db.collection<ChapterDocument>('chapters');
}

export async function getChaptersByBookId(bookId: string): Promise<ChapterDocument[]> {
	const col = await collection();
	return col
		.find({ bookId: new ObjectId(bookId) })
		.sort({ chapterIndex: 1 })
		.toArray();
}

export async function getChapterById(chapterId: string): Promise<ChapterDocument | null> {
	const col = await collection();
	return col.findOne({ _id: new ObjectId(chapterId) });
}

export async function insertManyChapters(chapters: ChapterInsert[]): Promise<void> {
	const col = await collection();
	await col.insertMany(chapters as ChapterDocument[]);
}

export async function updateChapterStatus(
	chapterId: string,
	status: ChapterProcessingStatus,
): Promise<void> {
	const col = await collection();
	await col.updateOne(
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
	chapterId: string,
	summary: string,
): Promise<void> {
	const col = await collection();
	await col.updateOne(
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
	bookId: string,
): Promise<{ total: number; completed: number; failed: number }> {
	const col = await collection();
	const bookOid = new ObjectId(bookId);

	const [total, completed, failed] = await Promise.all([
		col.countDocuments({ bookId: bookOid }),
		col.countDocuments({ bookId: bookOid, processingStatus: 'completed' }),
		col.countDocuments({ bookId: bookOid, processingStatus: 'failed' }),
	]);

	return { total, completed, failed };
}

export async function getPendingChapters(
	bookId: string,
	startIndex: number,
	limit: number,
): Promise<ChapterDocument[]> {
	const col = await collection();
	return col
		.find({
			bookId: new ObjectId(bookId),
			chapterIndex: { $gte: startIndex },
			processingStatus: { $in: ['pending', 'failed'] },
		})
		.sort({ chapterIndex: 1 })
		.limit(limit)
		.toArray();
}
