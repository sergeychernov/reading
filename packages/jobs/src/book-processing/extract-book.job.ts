import type { JobDefinition, JobContext } from 'neuroline';
import {
	withDb,
	getBookById,
	downloadEpub,
	epubBlobKey,
	bookFileKey,
	uploadBookFile,
	updateBookChapterCount,
	updateBookCoverUrl,
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
	metadataKey: string;
	coverKey: string | null;
	chapterKeys: string[];
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

			await withDb((db) => updateBookStatus(db, bookId, 'parsing'));

			const key = epubBlobKey(bookId);
			context.logger.info(`Downloading EPUB (key: ${key})`);
			const epubBuffer = await downloadEpub(key);
			context.logger.info(`Downloaded EPUB: ${epubBuffer.byteLength} bytes`);

			context.logger.info('Parsing EPUB...');
			const { metadata, metadataContent, chapters, cover } = await parseEpub(epubBuffer);
			context.logger.info(
				`Parsed: "${metadata.title}" by "${metadata.author}", ${chapters.length} chapters`,
			);

			const metadataKey = bookFileKey(bookId, 'metadata.json');
			await uploadBookFile(bookId, 'metadata.json', metadataContent, 'application/json');
			context.logger.info('Uploaded metadata.json');

			const { coverKey, coverFilename } = await uploadCover(bookId, cover, context);

			const chapterKeys: string[] = [];
			for (const chapter of chapters) {
				const chapterPath = `chapters/${chapter.index}.xhtml`;
				await uploadBookFile(bookId, chapterPath, chapter.content, 'application/xhtml+xml');
				chapterKeys.push(bookFileKey(bookId, chapterPath));
			}
			context.logger.info(`Uploaded ${chapterKeys.length} chapter files`);

			await withDb(async (db) => {
				await updateBookChapterCount(db, bookId, chapters.length);
				await updateBookCoverUrl(db, bookId, coverFilename);
				await updateBookStatus(db, bookId, 'parsed');
			});

			context.logger.info(`extract-book completed for ${bookId}`);

			return {
				bookId,
				title: metadata.title,
				author: metadata.author,
				chapterCount: chapters.length,
				metadataKey,
				coverKey,
				chapterKeys,
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

interface UploadCoverResult {
	coverKey: string | null;
	coverFilename: string | null;
}

async function uploadCover(
	bookId: string,
	cover: ParsedCoverImage | null,
	context: JobContext,
): Promise<UploadCoverResult> {
	if (!cover) {
		context.logger.info('No cover image found in EPUB');
		return { coverKey: null, coverFilename: null };
	}

	const ext = cover.mediaType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
	const coverFilename = `cover.${ext}`;
	await uploadBookFile(bookId, coverFilename, cover.data, cover.mediaType);
	context.logger.info(`Uploaded cover image (${cover.mediaType})`);
	return { coverKey: bookFileKey(bookId, coverFilename), coverFilename };
}
