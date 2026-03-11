import type { JobDefinition, JobContext } from 'neuroline';
import { MongoClient, ObjectId } from 'mongodb';
import type { ParseEpubOutput } from './parse-epub.job';

export interface SavedChapter {
	chapterId: string;
	index: number;
	title: string;
	text: string;
}

export interface SaveChaptersOutput {
	bookId: string;
	chapters: SavedChapter[];
}

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'reading';

/**
 * Saves parsed EPUB data to MongoDB:
 * - Updates book document with title, author, description
 * - Inserts chapter documents with rawText
 * - Sets book processingStatus to 'extracting'
 */
export const saveChaptersJob: JobDefinition = {
	name: 'save-chapters',
	async execute(
		rawInput: unknown,
		_options: unknown,
		context: JobContext,
	): Promise<SaveChaptersOutput> {
		const input = rawInput as ParseEpubOutput;
		context.logger.info(
			`Saving ${input.chapters.length} chapters for book ${input.bookId}`,
		);

		const client = new MongoClient(MONGODB_URI);
		try {
			await client.connect();
			const db = client.db(DB_NAME);

			const bookOid = new ObjectId(input.bookId);
			const now = new Date();

			try {
				await db.collection('books').updateOne(
					{ _id: bookOid },
					{
						$set: {
							title: input.metadata.title,
							author: input.metadata.author,
							description: input.metadata.description,
							updatedAt: now,
						},
					},
				);

				const chapterDocs = input.chapters.map((ch) => ({
					bookId: bookOid,
					chapterIndex: ch.index,
					title: ch.title,
					rawText: ch.text,
					summary: null,
					rawTextLength: ch.text.length,
					processingStatus: 'pending' as const,
					createdAt: now,
					updatedAt: now,
				}));

				const insertResult = await db
					.collection('chapters')
					.insertMany(chapterDocs);

				await db.collection('books').updateOne(
					{ _id: bookOid },
					{
						$set: {
							chapterCount: input.chapters.length,
							processingStatus: 'extracting',
							updatedAt: now,
						},
					},
				);

				const insertedIds = insertResult.insertedIds;
				const savedChapters: SavedChapter[] = input.chapters.map((ch, i) => ({
					chapterId: (insertedIds[i] as ObjectId).toHexString(),
					index: ch.index,
					title: ch.title,
					text: ch.text,
				}));

				context.logger.info(
					`Saved ${savedChapters.length} chapters for book ${input.bookId}, status set to 'extracting'`,
				);

				return {
					bookId: input.bookId,
					chapters: savedChapters,
				};
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Unknown error while saving chapters';
				context.logger.error(`save-chapters failed for book ${input.bookId}: ${message}`);
				await db.collection('books').updateOne(
					{ _id: bookOid },
					{ $set: { processingStatus: 'failed', processingError: message, updatedAt: new Date() } },
				);
				throw error;
			}
		} finally {
			await client.close();
		}
	},
};
