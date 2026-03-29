import type { JobDefinition, JobContext, SynapseContext } from 'neuroline';
import { ObjectId } from 'mongodb';
import type { LanguageItemBase, RareWordItem } from '@reading/llm-schemas';
import { withDb } from '@reading/data';
import type { ChapterProcessingInput } from '../types';
import type { ExtractChapterOutput } from './extract-chapter.job';
import type { ExtractIdiomsFromBlobOutput } from './extract-idioms.job';
import type { ExtractPhrasalVerbsFromBlobOutput } from './extract-phrasal-verbs.job';
import type { ExtractRareWordsFromBlobOutput } from './extract-rare-words.job';
import type { ExtractMeaningEnOutput } from '../chapter-extraction/extract-meaning-en.job';
import type { ExtractMeaningRuOutput } from '../chapter-extraction/extract-meaning-ru.job';

interface CategoryMeanings {
	idioms: string[];
	phrasalVerbs: string[];
	rareWords: string[];
}

export interface SaveLanguageItemsInput {
	chapterId: string;
	bookId: string;
	chapterIndex: number;
	idioms: LanguageItemBase[];
	phrasalVerbs: LanguageItemBase[];
	rareWords: RareWordItem[];
	meaningsEn?: CategoryMeanings;
	meaningsRu?: CategoryMeanings;
}

export interface SaveLanguageItemsOutput {
	itemsSaved: number;
}

export function buildSaveLanguageItemsSynapses(
	ctx: SynapseContext<ChapterProcessingInput>,
): SaveLanguageItemsInput {
	const extractChapter = ctx.getArtifact<ExtractChapterOutput>('extract-chapter');
	const idiomsArtifact = ctx.getArtifact<ExtractIdiomsFromBlobOutput>('extract-idioms');
	const phrasalVerbsArtifact = ctx.getArtifact<ExtractPhrasalVerbsFromBlobOutput>('extract-phrasal-verbs');
	const rareWordsArtifact = ctx.getArtifact<ExtractRareWordsFromBlobOutput>('extract-rare-words');
	const meaningEnArtifact = ctx.getArtifact<ExtractMeaningEnOutput>('extract-meaning-en');
	const meaningRuArtifact = ctx.getArtifact<ExtractMeaningRuOutput>('extract-meaning-ru');

	if (!extractChapter?.bookId) throw new Error('save-language-items: extract-chapter artifact not found');
	if (!idiomsArtifact?.idioms) throw new Error('save-language-items: extract-idioms artifact not found');
	if (!phrasalVerbsArtifact?.phrasalVerbs) throw new Error('save-language-items: extract-phrasal-verbs artifact not found');
	if (!rareWordsArtifact?.rareWords) throw new Error('save-language-items: extract-rare-words artifact not found');

	return {
		chapterId: ctx.pipelineInput.chapterId,
		bookId: extractChapter.bookId,
		chapterIndex: extractChapter.chapterIndex,
		idioms: idiomsArtifact.idioms,
		phrasalVerbs: phrasalVerbsArtifact.phrasalVerbs,
		rareWords: rareWordsArtifact.rareWords,
		meaningsEn: meaningEnArtifact ?? undefined,
		meaningsRu: meaningRuArtifact ?? undefined,
	};
}

/**
 * Saves extracted language items (idioms, phrasal verbs, rare words) to MongoDB.
 * Idempotent: clears previous language items for the chapter before inserting.
 */
export const saveLanguageItemsJob: JobDefinition = {
	name: 'save-language-items',
	async execute(
		rawInput: unknown,
		_options: unknown,
		context: JobContext,
	): Promise<SaveLanguageItemsOutput> {
		const input = rawInput as SaveLanguageItemsInput;
		const bookOid = new ObjectId(input.bookId);
		const chapterOid = new ObjectId(input.chapterId);
		const idioms = input.idioms ?? [];
		const phrasalVerbs = input.phrasalVerbs ?? [];
		const rareWords = input.rareWords ?? [];
		const enMeanings = input.meaningsEn;
		const ruMeanings = input.meaningsRu;

		const buildMeaning = (
			enArr: string[] | undefined,
			ruArr: string[] | undefined,
			index: number,
			fallback: string,
		) => ({
			en: enArr?.[index] ?? fallback,
			ru: ruArr?.[index] ?? fallback,
		});

		context.logger.info(
			`save-language-items: saving for chapter ${input.chapterIndex} ` +
			`(${idioms.length} idioms, ${phrasalVerbs.length} phrasal verbs, ${rareWords.length} rare words)`,
		);

		return withDb(async (db) => {
			const now = new Date();

			const languageItems = [
				...idioms.map((item, i) => ({
					bookId: bookOid,
					chapterId: chapterOid,
					category: 'idiom' as const,
					term: item.term,
					exampleFromBook: item.exampleFromBook,
					meaning: buildMeaning(enMeanings?.idioms, ruMeanings?.idioms, i, item.term),
					createdAt: now,
				})),
				...phrasalVerbs.map((item, i) => ({
					bookId: bookOid,
					chapterId: chapterOid,
					category: 'phrasal_verb' as const,
					term: item.term,
					exampleFromBook: item.exampleFromBook,
					meaning: buildMeaning(enMeanings?.phrasalVerbs, ruMeanings?.phrasalVerbs, i, item.term),
					createdAt: now,
				})),
			...rareWords.map((item, i) => ({
				bookId: bookOid,
				chapterId: chapterOid,
				category: 'rare_word' as const,
				term: item.term,
				partOfSpeech: item.partOfSpeech,
				exampleFromBook: item.exampleFromBook,
				meaning: buildMeaning(enMeanings?.rareWords, ruMeanings?.rareWords, i, item.term),
				createdAt: now,
			})),
			];

			await db.collection('languageItems').deleteMany({ chapterId: chapterOid });

			if (languageItems.length > 0) {
				await db.collection('languageItems').insertMany(languageItems);
			}

			context.logger.info(
				`save-language-items: saved ${languageItems.length} items for chapter ${input.chapterIndex}`,
			);

			return { itemsSaved: languageItems.length };
		});
	},
};
