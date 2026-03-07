import { uploadEpub } from '../blob';
import { insertBook } from '../db/books';
import type { BookInsert } from '../types/book';

interface UploadBookParams {
	fileBuffer: Buffer;
	fileName: string;
	audibleUrl: string | null;
	kindleUrl: string | null;
}

interface UploadBookResult {
	bookId: string;
	epubBlobUrl: string;
}

/**
 * Handles the upload step:
 * 1. Upload EPUB to Vercel Blob
 * 2. Create initial book record in MongoDB (status: 'parsing')
 *
 * Parsing, chapter extraction and LLM processing are handled by apps/pipeline.
 */
export async function uploadAndCreateBook(
	params: UploadBookParams,
): Promise<UploadBookResult> {
	const epubBlobUrl = await uploadEpub(params.fileName, params.fileBuffer);

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

	return { bookId, epubBlobUrl };
}
