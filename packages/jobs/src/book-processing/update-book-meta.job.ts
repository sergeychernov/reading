import type { JobDefinition, JobContext } from 'neuroline';
import { withDb, updateBookMeta, updateBookStatus } from '@reading/data';
import type { ParseEpubOutput } from './parse-epub.job';

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

		await withDb(async (db) => {
			await updateBookMeta(db, input.bookId, {
				title: input.metadata.title,
				author: input.metadata.author,
				description: input.metadata.description,
			});
			await updateBookStatus(db, input.bookId, 'completed');
		});

		context.logger.info(`Updated book metadata for ${input.bookId}`);
		return { bookId: input.bookId };
	},
};
