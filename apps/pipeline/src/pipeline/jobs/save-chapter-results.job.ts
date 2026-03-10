import type { JobDefinition, JobContext, SynapseContext } from 'neuroline';
import { MongoClient, ObjectId } from 'mongodb';
import type { LanguageItemExtracted } from '../../llm/schemas';
import type { ChapterExtractionInput } from '../chapter-extraction.pipeline';
import type { ExtractSummaryOutput } from './extract-summary.job';
import type { ExtractRarityOutput } from './extract-rarity.job';
import type { ExtractMeaningEnOutput } from './extract-meaning-en.job';
import type { ExtractMeaningRuOutput } from './extract-meaning-ru.job';

export interface SaveChapterResultsInput {
	bookId: string;
	chapterId: string;
	chapterIndex: number;
	chapterTitle: string;
	summary: string;
	idioms: LanguageItemExtracted[];
	phrasalVerbs: LanguageItemExtracted[];
	rareWords: LanguageItemExtracted[];
}

export interface SaveChapterResultsOutput {
	chapterIndex: number;
	itemsSaved: number;
}

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'reading';

function applyMeaningsByLanguage(
	items: ExtractRarityOutput['idioms'],
	enMeanings: string[],
	ruMeanings: string[],
): LanguageItemExtracted[] {
	return items.map((item, index) => ({
		...item,
		meaning: {
			en: enMeanings[index] ?? item.term,
			ru: ruMeanings[index] ?? item.term,
		},
	}));
}

/**
 * Builds the synapses input for save-chapter-results by collecting
 * artifacts from summary, rarity, and per-language meaning extraction jobs.
 */
export function buildSaveChapterResultsSynapses(ctx: SynapseContext): SaveChapterResultsInput {
	const pipelineInput = ctx.pipelineInput as ChapterExtractionInput;

	const summaryArtifact = ctx.getArtifact<ExtractSummaryOutput>('extract-summary');
	const rarityArtifact = ctx.getArtifact<ExtractRarityOutput>('extract-rarity');
	const meaningEnArtifact = ctx.getArtifact<ExtractMeaningEnOutput>('extract-meaning-en');
	const meaningRuArtifact = ctx.getArtifact<ExtractMeaningRuOutput>('extract-meaning-ru');

	if (!summaryArtifact) throw new Error('extract-summary artifact not found');
	if (!rarityArtifact) throw new Error('extract-rarity artifact not found');
	if (!meaningEnArtifact) throw new Error('extract-meaning-en artifact not found');
	if (!meaningRuArtifact) throw new Error('extract-meaning-ru artifact not found');

	return {
		bookId: pipelineInput.bookId,
		chapterId: pipelineInput.chapterId,
		chapterIndex: pipelineInput.chapterIndex,
		chapterTitle: pipelineInput.chapterTitle,
		summary: summaryArtifact.summary,
		idioms: applyMeaningsByLanguage(
			rarityArtifact.idioms,
			meaningEnArtifact.idioms,
			meaningRuArtifact.idioms,
		),
		phrasalVerbs: applyMeaningsByLanguage(
			rarityArtifact.phrasalVerbs,
			meaningEnArtifact.phrasalVerbs,
			meaningRuArtifact.phrasalVerbs,
		),
		rareWords: applyMeaningsByLanguage(
			rarityArtifact.rareWords,
			meaningEnArtifact.rareWords,
			meaningRuArtifact.rareWords,
		),
	};
}

/**
 * Saves all extracted language items and chapter summary to MongoDB.
 * Marks chapter as 'completed' on success, 'failed' on error.
 * Idempotent: clears previous language items before inserting.
 */
export const saveChapterResultsJob: JobDefinition = {
	name: 'save-chapter-results',
	async execute(
		rawInput: unknown,
		_options: unknown,
		context: JobContext,
	): Promise<SaveChapterResultsOutput> {
		const input = rawInput as SaveChapterResultsInput;
		const bookOid = new ObjectId(input.bookId);
		const chapterOid = new ObjectId(input.chapterId);

		context.logger.info(
			`Saving extraction results for chapter ${input.chapterIndex}: "${input.chapterTitle}"`,
		);

		const client = new MongoClient(MONGODB_URI);
		try {
			await client.connect();
			const db = client.db(DB_NAME);

			const now = new Date();

			const languageItems = [
				...input.idioms.map((item) => ({
					bookId: bookOid,
					chapterId: chapterOid,
					category: 'idiom' as const,
					term: item.term,
					meaning: item.meaning,
					exampleFromBook: item.exampleFromBook,
					rarity: item.rarity,
					createdAt: now,
				})),
				...input.phrasalVerbs.map((item) => ({
					bookId: bookOid,
					chapterId: chapterOid,
					category: 'phrasal_verb' as const,
					term: item.term,
					meaning: item.meaning,
					exampleFromBook: item.exampleFromBook,
					rarity: item.rarity,
					createdAt: now,
				})),
				...input.rareWords.map((item) => ({
					bookId: bookOid,
					chapterId: chapterOid,
					category: 'rare_word' as const,
					term: item.term,
					meaning: item.meaning,
					exampleFromBook: item.exampleFromBook,
					rarity: item.rarity,
					createdAt: now,
				})),
			];

			// Idempotent: clear previous items before inserting (safe for retries)
			await db.collection('languageItems').deleteMany({ chapterId: chapterOid });

			if (languageItems.length > 0) {
				await db.collection('languageItems').insertMany(languageItems);
			}

			await db.collection('chapters').updateOne(
				{ _id: chapterOid },
				{
					$set: {
						summary: input.summary || null,
						processingStatus: 'completed',
						updatedAt: new Date(),
					},
				},
			);

			context.logger.info(
				`Saved ${languageItems.length} language items for chapter ${input.chapterIndex} ` +
				`(${input.idioms.length} idioms, ${input.phrasalVerbs.length} phrasal verbs, ${input.rareWords.length} rare words)`,
			);

			return {
				chapterIndex: input.chapterIndex,
				itemsSaved: languageItems.length,
			};
		} catch (error) {
			const errorType = error != null
				? Object.getPrototypeOf(error as object)?.constructor?.name ?? typeof error
				: 'null';
			const errorMessage = error instanceof Error
				? (error.stack ?? error.message)
				: String(error);

			console.error(
				`[save-chapter-results] Chapter ${input.chapterIndex} FAILED [${errorType}]:`,
				errorMessage,
				error,
			);
			context.logger.error(
				`Chapter ${input.chapterIndex} "${input.chapterTitle}" failed [${errorType}]: ${errorMessage}`,
			);

			try {
				const db = client.db(DB_NAME);
				await db.collection('chapters').updateOne(
					{ _id: chapterOid },
					{ $set: { processingStatus: 'failed', updatedAt: new Date() } },
				);
			} catch (updateErr) {
				context.logger.error(`Failed to mark chapter as failed: ${updateErr}`);
			}

			throw error;
		} finally {
			await client.close();
		}
	},
};
