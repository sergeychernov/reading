import type { JobDefinition, JobContext } from 'neuroline';
import { MongoClient, ObjectId } from 'mongodb';
import type { LlmAdapter } from '../../llm/adapter';
import type { ChapterExtraction } from '../../llm/schemas';

export interface ProcessChapterInput {
	bookId: string;
	chapterId: string;
	chapterIndex: number;
	chapterTitle: string;
	chapterText: string;
}

export interface ProcessChapterOutput {
	chapterIndex: number;
	itemsSaved: number;
}

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'reading';

/**
 * Creates a job that processes a single chapter:
 * 1. Calls LLM to extract idioms, phrasal verbs, rare words, and summary
 * 2. Saves language items to MongoDB
 * 3. Updates chapter status and summary
 *
 * On error, marks the chapter as 'failed' before re-throwing.
 */
export function createProcessChapterJob(adapter: LlmAdapter): JobDefinition {
	return {
		name: 'process-chapter',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<ProcessChapterOutput> {
			const input = rawInput as ProcessChapterInput;
			const bookOid = new ObjectId(input.bookId);
			const chapterOid = new ObjectId(input.chapterId);

			context.logger.info(
				`Processing chapter ${input.chapterIndex}: "${input.chapterTitle}"`,
			);

			const client = new MongoClient(MONGODB_URI);
			try {
				await client.connect();
				const db = client.db(DB_NAME);

				// Mark chapter as extracting
				await db.collection('chapters').updateOne(
					{ _id: chapterOid },
					{ $set: { processingStatus: 'extracting', updatedAt: new Date() } },
				);

				// LLM extraction
				const extraction: ChapterExtraction = await adapter.extractFromChapter(
					input.chapterText,
				);

				context.logger.info(
					`Extracted: ${extraction.idioms.length} idioms, ` +
					`${extraction.phrasalVerbs.length} phrasal verbs, ` +
					`${extraction.rareWords.length} rare words`,
				);

				const now = new Date();

				// Build language items
				const languageItems = [
					...extraction.idioms.map((item) => ({
						bookId: bookOid,
						chapterId: chapterOid,
						category: 'idiom' as const,
						term: item.term,
						meaning: item.meaning,
						exampleFromBook: item.exampleFromBook,
						createdAt: now,
					})),
					...extraction.phrasalVerbs.map((item) => ({
						bookId: bookOid,
						chapterId: chapterOid,
						category: 'phrasal_verb' as const,
						term: item.term,
						meaning: item.meaning,
						exampleFromBook: item.exampleFromBook,
						createdAt: now,
					})),
					...extraction.rareWords.map((item) => ({
						bookId: bookOid,
						chapterId: chapterOid,
						category: 'rare_word' as const,
						term: item.term,
						meaning: item.meaning,
						exampleFromBook: item.exampleFromBook,
						createdAt: now,
					})),
				];

				// Idempotent: clear previous items before inserting (safe for retries)
				await db.collection('languageItems').deleteMany({ chapterId: chapterOid });

				if (languageItems.length > 0) {
					await db.collection('languageItems').insertMany(languageItems);
				}

				// Update chapter: save summary + mark completed
				await db.collection('chapters').updateOne(
					{ _id: chapterOid },
					{
						$set: {
							summary: extraction.summary || null,
							processingStatus: 'completed',
							updatedAt: new Date(),
						},
					},
				);

				context.logger.info(
					`Saved ${languageItems.length} language items for chapter ${input.chapterIndex}`,
				);

				return {
					chapterIndex: input.chapterIndex,
					itemsSaved: languageItems.length,
				};
			} catch (error) {
				// Mark chapter as failed before re-throwing
				try {
					const db = client.db(DB_NAME);
					await db.collection('chapters').updateOne(
						{ _id: chapterOid },
						{
							$set: {
								processingStatus: 'failed',
								updatedAt: new Date(),
							},
						},
					);
				} catch (updateErr) {
					context.logger.error(
						`Failed to mark chapter as failed: ${updateErr}`,
					);
				}

				throw error;
			} finally {
				await client.close();
			}
		},
	};
}
