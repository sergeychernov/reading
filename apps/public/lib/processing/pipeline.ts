import {
	getDb,
	computeContentHash,
	insertBook,
	uploadEpub,
	updateBookEpubUrl,
} from '@reading/data';
import type { BookInsert } from '@reading/data';

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
 * 1. Compute content hash of the EPUB file
 * 2. Create book record in MongoDB with the hash (unique field)
 * 3. Upload EPUB to Vercel Blob at books/{_id}/src.epub
 * 4. Update the book record with the blob URL
 *
 * Parsing, chapter extraction and LLM processing are handled by apps/pipeline.
 */
export async function uploadAndCreateBook(
	params: UploadBookParams,
): Promise<UploadBookResult> {
	const contentHash = computeContentHash(params.fileBuffer);

	const now = new Date();
	const bookData: BookInsert = {
		contentHash,
		title: params.fileName,
		author: '',
		description: '',
		coverImageUrl: null,
		epubBlobUrl: '',
		audibleUrl: params.audibleUrl,
		kindleUrl: params.kindleUrl,
		chapterCount: 0,
		processingStatus: 'parsing',
		processingError: null,
		createdAt: now,
		updatedAt: now,
	};

	const db = await getDb();
	const bookId = await insertBook(db, bookData);

	const epubBlobUrl = await uploadEpub(bookId, params.fileBuffer);
	await updateBookEpubUrl(db, bookId, epubBlobUrl);

	return { bookId, epubBlobUrl };
}
