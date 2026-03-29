import type { LanguageItemBase, LanguageItemScored, RareWordItem } from '@reading/llm-schemas';
import type { LlmAdapter } from '../types';

export class StubAdapter implements LlmAdapter {
	async extractSummary(): Promise<string> {
		return '';
	}

	async extractIdioms(): Promise<LanguageItemBase[]> {
		return [];
	}

	async extractPhrasalVerbs(): Promise<LanguageItemBase[]> {
		return [];
	}

	async extractRareWords(): Promise<RareWordItem[]> {
		return [];
	}

	async extractRarity(items: LanguageItemBase[]): Promise<LanguageItemScored[]> {
		return items.map((item) => ({ ...item, rarity: 5 }));
	}

	async translateMeanings(items: LanguageItemScored[]): Promise<string[]> {
		return items.map((item) => item.term);
	}
}
