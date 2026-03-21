import type { JobDefinition, JobContext } from 'neuroline';
import { withDb, markBookFailed, downloadEpub, epubBlobKey } from '@reading/data';
import type { BookProcessingInput } from '../types';

export interface FetchEpubOutput {
	bookId: string;
	/** Base64-encoded EPUB file content */
	epubBase64: string;
}

/**
 * Downloads the EPUB file from Blob storage using a key derived from bookId.
 * Returns the raw content as base64 for neuroline artifact.
 * On failure, sets the book `failed` flag via `markBookFailed` before rethrowing.
 */
export const fetchEpubJob: JobDefinition = {
	name: 'fetch-epub',
	async execute(
		rawInput: unknown,
		_options: unknown,
		context: JobContext,
	): Promise<FetchEpubOutput> {
		const input = rawInput as BookProcessingInput;
		const key = epubBlobKey(input.bookId);
		context.logger.info(`Fetching EPUB for book ${input.bookId} (key: ${key})`);

		try {
			const epubBuffer = await downloadEpub(key);
			const epubBase64 = epubBuffer.toString('base64');

			context.logger.info(
				`Fetched EPUB for book ${input.bookId} (${epubBuffer.byteLength} bytes)`,
			);

			return {
				bookId: input.bookId,
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
