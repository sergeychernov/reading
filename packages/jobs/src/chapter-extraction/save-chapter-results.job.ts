import type { JobDefinition, JobContext, SynapseContext } from 'neuroline';
import { ObjectId } from 'mongodb';
import type { LanguageItemExtracted } from '@reading/llm-schemas';
import { withDb, updateChapterStatus, updateChapterSummary } from '@reading/data';
import type { ChapterExtractionInput } from '../types';
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

		return withDb(async (db) => {
			try {
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

				await db.collection('languageItems').deleteMany({ chapterId: chapterOid });

				if (languageItems.length > 0) {
					await db.collection('languageItems').insertMany(languageItems);
				}

				await updateChapterSummary(db, input.chapterId, input.summary || '');
				await updateChapterStatus(db, input.chapterId, 'completed');

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
					await updateChapterStatus(db, input.chapterId, 'failed');
				} catch (updateErr) {
					context.logger.error(`Failed to mark chapter as failed: ${updateErr}`);
				}

				throw error;
			}
		});
	},
};
