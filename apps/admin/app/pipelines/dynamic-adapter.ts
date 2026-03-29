import type { LlmAdapter } from '@reading/jobs';
import { StubAdapter, GatewayAdapter } from '@reading/jobs';
import type { LanguageItemBase, LanguageItemScored, MeaningTranslations, RareWordItem } from '@reading/llm-schemas';
import { getLlmConfig } from '../../lib/db/llm-config';
import type { LlmAdapterConfig, LlmJobName } from '../../lib/types/llm-config';

function createAdapterFromConfig(config: LlmAdapterConfig): LlmAdapter {
	if (config.adapter === 'gateway') {
		return new GatewayAdapter({
			model: config.gateway.model,
			maxTokens: config.gateway.maxTokens,
			temperature: config.gateway.temperature,
		});
	}
	return new StubAdapter();
}

/**
 * Reads the active LLM adapter config from MongoDB on every call,
 * mirroring the pipeline app's DynamicAdapter pattern.
 */
export class DynamicAdapter implements LlmAdapter {
	private async getAdapter(jobName: LlmJobName): Promise<LlmAdapter> {
		const config = await getLlmConfig();
		const jobConfig = config.jobs?.[jobName] ?? config.default;
		return createAdapterFromConfig(jobConfig);
	}

	async extractSummary(chapterText: string): Promise<string> {
		return (await this.getAdapter('extract-summary')).extractSummary(chapterText);
	}

	async extractIdioms(chapterText: string): Promise<LanguageItemBase[]> {
		return (await this.getAdapter('extract-idioms')).extractIdioms(chapterText);
	}

	async extractPhrasalVerbs(chapterText: string): Promise<LanguageItemBase[]> {
		return (await this.getAdapter('extract-phrasal-verbs')).extractPhrasalVerbs(chapterText);
	}

	async extractRareWords(chapterText: string): Promise<RareWordItem[]> {
		return (await this.getAdapter('extract-rare-words')).extractRareWords(chapterText);
	}

	async extractRarity(items: LanguageItemBase[]): Promise<LanguageItemScored[]> {
		return (await this.getAdapter('extract-rarity')).extractRarity(items);
	}

	async translateMeanings(
		items: LanguageItemScored[],
		language: keyof MeaningTranslations,
	): Promise<string[]> {
		const jobName: LlmJobName = language === 'ru' ? 'extract-meaning-ru' : 'extract-meaning-en';
		return (await this.getAdapter(jobName)).translateMeanings(items, language);
	}
}
