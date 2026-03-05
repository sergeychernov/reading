import { ObjectId } from 'mongodb';
import { parseEpub } from '@reading/epub-utils';
import { uploadEpub, uploadCoverImage } from '../blob';
import { insertBook, updateBookStatus, updateBookChapterCount } from '../db/books';
import { insertManyChapters } from '../db/chapters';
import type { BookInsert } from '../types/book';
import type { ChapterInsert } from '../types/chapter';

interface UploadBookParams {
	fileBuffer: Buffer;
	fileName: string;
	audibleUrl: string | null;
	kindleUrl: string | null;
}

interface UploadBookResult {
	bookId: string;
	chapterCount: number;
	epubBlobUrl: string;
}

/**
 * Handles the full upload pipeline:
 * 1. Upload EPUB to Vercel Blob
 * 2. Parse EPUB metadata and chapters
 * 3. Create book and chapter documents in MongoDB
 */
export async function uploadAndParseBook(
	params: UploadBookParams,
): Promise<UploadBookResult> {
	// Step 1: Upload EPUB to Vercel Blob
	const epubBlobUrl = await uploadEpub(params.fileName, params.fileBuffer);

	// Step 2: Create initial book record
	const now = new Date();
	const bookData: BookInsert = {
		title: 'Processing...',
		author: '',
		description: '',
		coverImageUrl: null,
		epubBlobUrl,
		audibleUrl: params.audibleUrl,
		kindleUrl: params.kindleUrl,
		chapterCount: 0,
		processingStatus: 'parsing',
		processingError: null,
		createdAt: now,
		updatedAt: now,
	};

	const bookId = await insertBook(bookData);

	try {
		// Step 3: Parse EPUB
		const { metadata, chapters } = await parseEpub(params.fileBuffer);

		// Update book with parsed metadata
		const { getDb } = await import('../mongodb');
		const db = await getDb();
		await db.collection('books').updateOne(
			{ _id: new ObjectId(bookId) },
			{
				$set: {
					title: metadata.title,
					author: metadata.author,
					description: metadata.description,
					updatedAt: new Date(),
				},
			},
		);

		// Step 4: Create chapter documents
		const chapterDocs: ChapterInsert[] = chapters.map((ch) => ({
			bookId: new ObjectId(bookId),
			chapterIndex: ch.index,
			title: ch.title,
			rawText: ch.text,
			summary: null,
			rawTextLength: ch.text.length,
			processingStatus: 'pending' as const,
			createdAt: now,
			updatedAt: now,
		}));

		if (chapterDocs.length > 0) {
			await insertManyChapters(chapterDocs);
		}

		await updateBookChapterCount(bookId, chapters.length);
		await updateBookStatus(bookId, 'extracting');

		return { bookId, chapterCount: chapters.length, epubBlobUrl };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown parsing error';
		await updateBookStatus(bookId, 'failed', message);
		throw error;
	}
}
