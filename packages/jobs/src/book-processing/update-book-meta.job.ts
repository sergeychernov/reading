import type { JobDefinition, JobContext } from 'neuroline';
import { MongoClient, ObjectId } from 'mongodb';
import type { ParseEpubOutput } from './parse-epub.job';

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'reading';

/**
 * Updates only book metadata in MongoDB from parsed EPUB (title, author, description).
 * Also sets processingStatus to 'done' and clears processingError on success.
 * Does not touch chapters. Used by book-reprocessing pipeline in admin.
 */
export const updateBookMetaJob: JobDefinition = {
	name: 'update-book-meta',
	async execute(
		rawInput: unknown,
		_options: unknown,
		context: JobContext,
	): Promise<{ bookId: string }> {
		const input = rawInput as ParseEpubOutput;
		context.logger.info(`Updating book metadata for ${input.bookId}`);

		const client = new MongoClient(MONGODB_URI);
		try {
			await client.connect();
			const db = client.db(DB_NAME);
			const bookOid = new ObjectId(input.bookId);
			const now = new Date();

			await db.collection('books').updateOne(
				{ _id: bookOid },
				{
					$set: {
						title: input.metadata.title,
						author: input.metadata.author,
						description: input.metadata.description,
						processingStatus: 'done',
						processingError: null,
						updatedAt: now,
					},
				},
			);

			context.logger.info(`Updated book metadata for ${input.bookId}`);
			return { bookId: input.bookId };
		} finally {
			await client.close();
		}
	},
};
