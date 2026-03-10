import type { LlmAdapter } from './adapter';
import type {
	LanguageItemBase,
	LanguageItemScored,
	MeaningTranslations,
} from './schemas';

/**
 * Stub adapter that returns realistic test data.
 * Useful for testing the full pipeline flow without an actual LLM provider.
 */
export class StubAdapter implements LlmAdapter {
	private delay(): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, 100));
	}

	async extractSummary(_chapterText: string): Promise<string> {
		await this.delay();
		return (
			'The chapter introduces the protagonist arriving in a new city. ' +
			'He struggles to find his way around and meets a local who helps him. ' +
			'Through their conversation, the protagonist learns about the history of the area. ' +
			'By the end, he feels more at home and decides to stay longer than planned.'
		);
	}

	async extractLanguageItems(chapterText: string): Promise<{
		idioms: LanguageItemBase[];
		phrasalVerbs: LanguageItemBase[];
		rareWords: LanguageItemBase[];
	}> {
		return {
			idioms: await this.extractIdioms(chapterText),
			phrasalVerbs: await this.extractPhrasalVerbs(chapterText),
			rareWords: await this.extractRareWords(chapterText),
		};
	}

	async extractIdioms(_chapterText: string): Promise<LanguageItemBase[]> {
		await this.delay();
		return [
			{
				term: 'break the ice',
				exampleFromBook: 'He decided to break the ice by asking about the local cuisine.',
			},
			{
				term: 'beat around the bush',
				exampleFromBook: 'She kept beating around the bush instead of telling him the real reason she was there.',
			},
			{
				term: 'once in a blue moon',
				exampleFromBook: 'Visitors came to this part of town once in a blue moon.',
			},
		];
	}

	async extractPhrasalVerbs(_chapterText: string): Promise<LanguageItemBase[]> {
		await this.delay();
		return [
			{
				term: 'run into',
				exampleFromBook: 'He ran into an old friend at the market square.',
			},
			{
				term: 'figure out',
				exampleFromBook: 'It took him a while to figure out how the local bus system worked.',
			},
			{
				term: 'settle in',
				exampleFromBook: 'After a few days, he finally began to settle in.',
			},
		];
	}

	async extractRareWords(_chapterText: string): Promise<LanguageItemBase[]> {
		await this.delay();
		return [
			{
				term: 'ephemeral',
				exampleFromBook: 'The beauty of the sunset was ephemeral, gone within minutes.',
			},
			{
				term: 'ubiquitous',
				exampleFromBook: 'Street vendors were ubiquitous in the old quarter of the city.',
			},
			{
				term: 'serendipity',
				exampleFromBook: 'It was pure serendipity that he stumbled upon the hidden garden.',
			},
		];
	}

	async extractRarity(items: LanguageItemBase[]): Promise<LanguageItemScored[]> {
		await this.delay();

		return items.map((item) => {
			// Simple deterministic heuristic for local pipeline testing.
			const rarity = Math.max(1, Math.min(10, Math.round(item.term.length / 2)));
			return {
				...item,
				rarity,
			};
		});
	}

	async translateMeanings(
		items: LanguageItemScored[],
		language: keyof MeaningTranslations,
	): Promise<string[]> {
		await this.delay();
		return items.map((item) =>
			language === 'en'
				? `Context meaning of "${item.term}" from the chapter sentence.`
				: `Контекстный перевод "${item.term}" из предложения главы.`,
		);
	}
}
