import type {
	LanguageItemBase,
	LanguageItemExtracted,
	LanguageItemScored,
	MeaningTranslations,
} from './schemas';

/**
 * Abstract interface for LLM-based language extraction.
 * Each method handles a single extraction task to reduce model complexity
 * and improve reliability on large chapters.
 */
export interface LlmAdapter {
	extractSummary(chapterText: string): Promise<string>;
	extractLanguageItems(chapterText: string): Promise<{
		idioms: LanguageItemBase[];
		phrasalVerbs: LanguageItemBase[];
		rareWords: LanguageItemBase[];
	}>;
	extractIdioms(chapterText: string): Promise<LanguageItemBase[]>;
	extractPhrasalVerbs(chapterText: string): Promise<LanguageItemBase[]>;
	extractRareWords(chapterText: string): Promise<LanguageItemBase[]>;
	extractRarity(items: LanguageItemBase[]): Promise<LanguageItemScored[]>;
	translateMeanings(
		items: LanguageItemScored[],
		language: keyof MeaningTranslations,
	): Promise<string[]>;
}
