import type { JobDefinition, JobContext } from 'neuroline';
import type { FetchEpubOutput } from './fetch-epub.job';
import { parseEpub } from '@reading/epub-utils';
import type { ParsedBookMetadata, ParsedChapter } from '@reading/epub-utils';
import { withDb, markBookFailed } from '@reading/data';

/** Raw chapter from parser (index + XHTML content). */
export interface ParseEpubChapter {
	index: number;
	content: string;
}

export interface ParseEpubOutput {
	bookId: string;
	metadata: ParsedBookMetadata;
	chapters: ParseEpubChapter[];
}

/**
 * Parses the EPUB file content received from the fetch-epub artifact.
 * On failure, marks the book as 'failed' in MongoDB before rethrowing.
 */
export const parseEpubJob: JobDefinition = {
	name: 'parse-epub',
	async execute(
		rawInput: unknown,
		_options: unknown,
		context: JobContext,
	): Promise<ParseEpubOutput> {
		const input = rawInput as FetchEpubOutput;
		context.logger.info(`Parsing EPUB for book ${input.bookId}`);

		try {
			const epubBuffer = Buffer.from(input.epubBase64, 'base64');

			const { metadata, chapters } = await parseEpub(epubBuffer);

			context.logger.info(
				`Parsed EPUB for book ${input.bookId}: "${metadata.title}" by "${metadata.author}", ${chapters.length} chapters`,
			);

			const parsedChapters: ParseEpubChapter[] = chapters.map(
				(ch: ParsedChapter) => ({
					index: ch.index,
					content: ch.content,
				}),
			);

			return {
				bookId: input.bookId,
				metadata,
				chapters: parsedChapters,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error during EPUB parsing';
			context.logger.error(`parse-epub failed for book ${input.bookId}: ${message}`);
			await withDb((db) => markBookFailed(db, input.bookId, message));
			throw error;
		}
	},
};
