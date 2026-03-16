import type { JobDefinition, JobContext } from 'neuroline';
import {
	withDb,
	getBookById,
	downloadEpub,
	uploadBookFile,
	updateBookChapterCount,
	updateBookStatus,
	markBookFailed,
} from '@reading/data';
import { parseEpub } from '@reading/epub-utils';
import type { ParsedCoverImage } from '@reading/epub-utils';

export interface ExtractBookInput {
	bookId: string;
}

export interface ExtractBookOutput {
	bookId: string;
	title: string;
	author: string;
	chapterCount: number;
	metadataUrl: string;
	coverUrl: string | null;
	chapterUrls: string[];
}

/**
 * All-in-one job: downloads the EPUB from Blob, parses it, and uploads
 * chapters, cover image and metadata back to Blob as individual files.
 *
 * Blob layout after execution:
 *   /books/{bookId}/metadata.json  (raw epub.getMetadata() result)
 *   /books/{bookId}/cover.{ext}     (if cover found)
 *   /books/{bookId}/chapters/0.xhtml
 *   /books/{bookId}/chapters/1.xhtml
 *   ...
 */
export const extractBookJob: JobDefinition<ExtractBookInput, ExtractBookOutput> = {
	name: 'extract-book',
	async execute(
		input: ExtractBookInput,
		_options: unknown,
		context: JobContext,
	): Promise<ExtractBookOutput> {
		const { bookId } = input;
		context.logger.info(`extract-book started for ${bookId}`);

		try {
			const book = await withDb((db) => getBookById(db, bookId));
			if (!book) {
				throw new Error(`Book ${bookId} not found in database`);
			}
			if (!book.epubBlobUrl) {
				throw new Error(`Book ${bookId} has no epubBlobUrl`);
			}

			await withDb((db) => updateBookStatus(db, bookId, 'parsing'));

			context.logger.info(
				`Downloading EPUB from ${book.epubBlobUrl} (BLOB_READ_WRITE_TOKEN set: ${Boolean(process.env.BLOB_READ_WRITE_TOKEN)})`,
			);
			const epubBuffer = await downloadEpub(book.epubBlobUrl);
			context.logger.info(`Downloaded EPUB: ${epubBuffer.byteLength} bytes`);

			context.logger.info('Parsing EPUB...');
			const { metadata, metadataContent, chapters, cover } = await parseEpub(epubBuffer);
			context.logger.info(
				`Parsed: "${metadata.title}" by "${metadata.author}", ${chapters.length} chapters`,
			);

			// Upload metadata as raw getMetadata() result (unchanged)
			const metadataUrl = await uploadBookFile(
				bookId,
				'metadata.json',
				metadataContent,
				'application/json',
			);
			context.logger.info('Uploaded metadata.json');

			// Upload cover image (if present)
			const coverUrl = await uploadCover(bookId, cover, context);

			// Upload chapters as raw XHTML
			const chapterUrls: string[] = [];
			for (const chapter of chapters) {
				const url = await uploadBookFile(
					bookId,
					`chapters/${chapter.index}.xhtml`,
					chapter.content,
					'application/xhtml+xml',
				);
				chapterUrls.push(url);
			}
			context.logger.info(`Uploaded ${chapterUrls.length} chapter files`);

			// Update book record in MongoDB (metadata filled by parse-metadata job)
			await withDb(async (db) => {
				await updateBookChapterCount(db, bookId, chapters.length);
				await updateBookStatus(db, bookId, 'parsed');
			});

			context.logger.info(`extract-book completed for ${bookId}`);

			return {
				bookId,
				title: metadata.title,
				author: metadata.author,
				chapterCount: chapters.length,
				metadataUrl,
				coverUrl,
				chapterUrls,
			};
		} catch (error) {
			const message = error instanceof Error
				? error.message
				: 'Unknown error during book extraction';
			context.logger.error(`extract-book failed for ${bookId}: ${message}`);
			await withDb((db) => markBookFailed(db, bookId, message));
			throw error;
		}
	},
};

async function uploadCover(
	bookId: string,
	cover: ParsedCoverImage | null,
	context: JobContext,
): Promise<string | null> {
	if (!cover) {
		context.logger.info('No cover image found in EPUB');
		return null;
	}

	const ext = cover.mediaType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
	const url = await uploadBookFile(
		bookId,
		`cover.${ext}`,
		cover.data,
		cover.mediaType,
	);
	context.logger.info(`Uploaded cover image (${cover.mediaType})`);
	return url;
}
