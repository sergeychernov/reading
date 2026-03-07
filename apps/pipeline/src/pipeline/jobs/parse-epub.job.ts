import type { JobDefinition, JobContext } from 'neuroline';
import type { FetchEpubOutput } from './fetch-epub.job';
import { parseEpub } from '@reading/epub-utils';
import type { ParsedBookMetadata, ParsedChapter } from '@reading/epub-utils';
import { MongoClient, ObjectId } from 'mongodb';

export interface ParseEpubChapter {
	index: number;
	title: string;
	text: string;
}

export interface ParseEpubOutput {
	bookId: string;
	metadata: ParsedBookMetadata;
	chapters: ParseEpubChapter[];
}

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'reading';

async function markBookFailed(bookId: string, message: string): Promise<void> {
	const client = new MongoClient(MONGODB_URI);
	try {
		await client.connect();
		await client.db(DB_NAME).collection('books').updateOne(
			{ _id: new ObjectId(bookId) },
			{ $set: { processingStatus: 'failed', processingError: message, updatedAt: new Date() } },
		);
	} finally {
		await client.close();
	}
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
					title: ch.title,
					text: ch.text,
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
			await markBookFailed(input.bookId, message);
			throw error;
		}
	},
};
