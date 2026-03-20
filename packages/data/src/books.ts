import { ObjectId, type Db } from 'mongodb';
import type { BookDocument, BookInsert, BookProcessingStatus } from './types';

const COLLECTION = 'books';

function col(db: Db) {
	return db.collection<BookDocument>(COLLECTION);
}

/** Returns books visible in user-facing lists, sorted by createdAt DESC. */
export async function getAllBooks(db: Db): Promise<BookDocument[]> {
	return col(db)
		.find({
			failed: { $ne: true },
			processingStatus: { $nin: ['failed', 'uploaded', 'uploading'] },
		})
		.sort({ createdAt: -1 })
		.toArray();
}

/** Returns all books without filtering, sorted by createdAt DESC. */
export async function getAllBooksAdmin(db: Db): Promise<BookDocument[]> {
	return col(db)
		.find({})
		.sort({ createdAt: -1 })
		.toArray();
}

export async function getBookById(db: Db, bookId: string): Promise<BookDocument | null> {
	return col(db).findOne({ _id: new ObjectId(bookId) });
}

export async function insertBook(db: Db, book: BookInsert): Promise<string> {
	const result = await col(db).insertOne(book as BookDocument);
	return result.insertedId.toHexString();
}

export async function updateBookStatus(
	db: Db,
	bookId: string,
	status: BookProcessingStatus,
	error?: string,
): Promise<void> {
	await col(db).updateOne(
		{ _id: new ObjectId(bookId) },
		{
			$set: {
				processingStatus: status,
				processingError: error ?? null,
				failed: false,
				updatedAt: new Date(),
			},
		},
	);
}

export async function updateBookChapterCount(
	db: Db,
	bookId: string,
	chapterCount: number,
): Promise<void> {
	await col(db).updateOne(
		{ _id: new ObjectId(bookId) },
		{
			$set: {
				chapterCount,
				updatedAt: new Date(),
			},
		},
	);
}

export async function updateBookCoverUrl(
	db: Db,
	bookId: string,
	coverImageUrl: string | null,
): Promise<void> {
	await col(db).updateOne(
		{ _id: new ObjectId(bookId) },
		{
			$set: {
				coverImageUrl,
				updatedAt: new Date(),
			},
		},
	);
}

export async function updateBookMeta(
	db: Db,
	bookId: string,
	meta: { title: string; author: string; description: string },
): Promise<void> {
	await col(db).updateOne(
		{ _id: new ObjectId(bookId) },
		{
			$set: {
				title: meta.title,
				author: meta.author,
				description: meta.description,
				updatedAt: new Date(),
			},
		},
	);
}

export async function markBookUploaded(
	db: Db,
	bookId: string,
): Promise<void> {
	await col(db).updateOne(
		{ _id: new ObjectId(bookId) },
		{
			$set: {
				processingStatus: 'uploaded',
				processingError: null,
				failed: false,
				updatedAt: new Date(),
			},
		},
	);
}

/** Convenience wrapper — marks a book as failed with the given error message. */
export async function markBookFailed(
	db: Db,
	bookId: string,
	message: string,
): Promise<void> {
	await col(db).updateOne(
		{ _id: new ObjectId(bookId) },
		{
			$set: {
				failed: true,
				processingError: message,
				updatedAt: new Date(),
			},
		},
	);
}
