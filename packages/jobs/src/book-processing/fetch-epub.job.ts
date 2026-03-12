import type { JobDefinition, JobContext } from 'neuroline';
import { withDb, markBookFailed, downloadEpub } from '@reading/data';
import type { BookProcessingInput } from '../types';

export interface FetchEpubOutput {
	bookId: string;
	epubBlobUrl: string;
	/** Base64-encoded EPUB file content */
	epubBase64: string;
}

/**
 * Downloads the EPUB file from private Vercel Blob storage.
 * Uses BLOB_READ_WRITE_TOKEN for Bearer auth. Returns the raw content as base64
 * for neuroline artifact. On failure, marks the book as 'failed' in MongoDB before rethrowing.
 */
export const fetchEpubJob: JobDefinition = {
	name: 'fetch-epub',
	async execute(
		rawInput: unknown,
		_options: unknown,
		context: JobContext,
	): Promise<FetchEpubOutput> {
		const input = rawInput as BookProcessingInput;
		context.logger.info(
			`Fetching EPUB for book ${input.bookId} from ${input.epubBlobUrl}`,
		);

		try {
			context.logger.info(`Fetching EPUB from ${input.epubBlobUrl}`);

			const epubBuffer = await downloadEpub(input.epubBlobUrl);
			const epubBase64 = epubBuffer.toString('base64');

			context.logger.info(
				`Fetched EPUB for book ${input.bookId} (${epubBuffer.byteLength} bytes)`,
			);

			return {
				bookId: input.bookId,
				epubBlobUrl: input.epubBlobUrl,
				epubBase64,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error during EPUB fetch';
			context.logger.error(`fetch-epub failed for book ${input.bookId}: ${message}`);
			await withDb((db) => markBookFailed(db, input.bookId, message));
			throw error;
		}
	},
};
