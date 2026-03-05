import { ObjectId } from 'mongodb';
import { getDb } from '../mongodb';
import type { BookDocument, BookInsert } from '../types/book';
import type { BookProcessingStatus } from '../types/processing';

async function collection() {
	const db = await getDb();
	return db.collection<BookDocument>('books');
}

export async function getAllBooks(): Promise<BookDocument[]> {
	const col = await collection();
	return col.find().sort({ createdAt: -1 }).toArray();
}

export async function getBookById(bookId: string): Promise<BookDocument | null> {
	const col = await collection();
	return col.findOne({ _id: new ObjectId(bookId) });
}

export async function insertBook(book: BookInsert): Promise<string> {
	const col = await collection();
	const result = await col.insertOne(book as BookDocument);
	return result.insertedId.toHexString();
}

export async function updateBookStatus(
	bookId: string,
	status: BookProcessingStatus,
	error?: string,
): Promise<void> {
	const col = await collection();
	await col.updateOne(
		{ _id: new ObjectId(bookId) },
		{
			$set: {
				processingStatus: status,
				processingError: error ?? null,
				updatedAt: new Date(),
			},
		},
	);
}

export async function updateBookChapterCount(
	bookId: string,
	chapterCount: number,
): Promise<void> {
	const col = await collection();
	await col.updateOne(
		{ _id: new ObjectId(bookId) },
		{
			$set: {
				chapterCount,
				updatedAt: new Date(),
			},
		},
	);
}
