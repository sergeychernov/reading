import { createGateway, generateObject, generateText } from 'ai';
import { z } from 'zod';

import type { LlmAdapter } from '../adapter';
import {
	languageItemBaseSchema,
	type MeaningTranslations,
	type LanguageItemBase,
	type LanguageItemScored,
} from '../schemas';
import {
	SUMMARY_SYSTEM_PROMPT,
	LANGUAGE_ITEMS_SYSTEM_PROMPT,
	IDIOMS_SYSTEM_PROMPT,
	PHRASAL_VERBS_SYSTEM_PROMPT,
	RARE_WORDS_SYSTEM_PROMPT,
	RARITY_SYSTEM_PROMPT,
	buildMeaningSystemPrompt,
	buildLanguageItemsPrompt,
	buildSummaryPrompt,
	buildItemsPrompt,
	buildMeaningPrompt,
	buildRarityPrompt,
} from './prompts';

/**
 * Repair function for generateObject: when the model returns the `items`
 * field as a stringified JSON array instead of an actual array, parse it.
 */
async function repairJsonText({ text }: { text: string }): Promise<string | null> {
	try {
		const parsed = JSON.parse(text);
		if (typeof parsed.items === 'string') {
			parsed.items = JSON.parse(parsed.items);
			console.log('[GatewayAdapter] repaired stringified items array');
			return JSON.stringify(parsed);
		}
		let repairedExtractionLists = false;
		for (const key of ['idioms', 'phrasalVerbs', 'rareWords'] as const) {
			if (typeof parsed[key] === 'string') {
				parsed[key] = JSON.parse(parsed[key]);
				repairedExtractionLists = true;
			}
		}
		if (repairedExtractionLists) {
			console.log('[GatewayAdapter] repaired stringified extraction lists');
			return JSON.stringify(parsed);
		}
		if (typeof parsed.scores === 'string') {
			parsed.scores = JSON.parse(parsed.scores);
			console.log('[GatewayAdapter] repaired stringified scores array');
			return JSON.stringify(parsed);
		}
		if (typeof parsed.translations === 'string') {
			parsed.translations = JSON.parse(parsed.translations);
			console.log('[GatewayAdapter] repaired stringified translations array');
			return JSON.stringify(parsed);
		}
	} catch {
		// nothing to repair if JSON is broken
	}
	return null;
}

const AI_GATEWAY_URL = process.env.AI_GATEWAY_URL ?? '';
const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY ?? '';

/** Default gateway base URL; SDK appends /language-model, so path must be .../v1/ai. */
const DEFAULT_GATEWAY_BASE = 'https://ai-gateway.vercel.sh/v1/ai';

export interface GatewayAdapterOptions {
	/** Gateway model id (e.g. anthropic/claude-sonnet-4.6, openai/gpt-4.1). */
	model: string;
	maxTokens?: number;
	/** Sampling temperature (0–2). Lower = more deterministic. Default 0.2 for extraction. */
	temperature?: number;
	gatewayUrl?: string;
	gatewayApiKey?: string;
}

export class GatewayAdapter implements LlmAdapter {
	private readonly model: string;
	private readonly maxTokens: number;
	private readonly temperature: number;
	private readonly gatewayUrl: string;
	private readonly gatewayApiKey: string;

	constructor(options: GatewayAdapterOptions) {
		this.model = options.model;
		this.maxTokens = options.maxTokens ?? 4096;
		this.temperature = options.temperature ?? 0.2;
		this.gatewayUrl = options.gatewayUrl ?? AI_GATEWAY_URL;
		this.gatewayApiKey = options.gatewayApiKey ?? AI_GATEWAY_API_KEY;
	}

	private createGatewayModel() {
		const isDefaultGateway =
			!this.gatewayUrl ||
			this.gatewayUrl === DEFAULT_GATEWAY_BASE ||
			this.gatewayUrl === 'https://ai-gateway.vercel.sh' ||
			this.gatewayUrl === 'https://ai-gateway.vercel.sh/v1';
		const baseURL = isDefaultGateway
			? undefined
			: this.gatewayUrl.endsWith('/v1/ai')
				? this.gatewayUrl
				: `${this.gatewayUrl.replace(/\/$/, '')}/v1/ai`;
		const gateway = createGateway({
			apiKey: this.gatewayApiKey,
			...(baseURL && { baseURL }),
		});
		return gateway(this.model);
	}

	async extractSummary(chapterText: string): Promise<string> {
		console.log(
			`[GatewayAdapter] extractSummary model=${this.model} textLength=${chapterText.length}`,
		);
		try {
			const { text, usage } = await generateText({
				model: this.createGatewayModel(),
				system: SUMMARY_SYSTEM_PROMPT,
				prompt: buildSummaryPrompt(chapterText),
				maxOutputTokens: this.maxTokens,
				temperature: this.temperature,
			});
			console.log(
				`[GatewayAdapter] extractSummary done tokens(in=${usage.inputTokens} out=${usage.outputTokens})`,
			);
			return text.trim();
		} catch (error) {
			console.error('[GatewayAdapter] extractSummary FAILED:', error);
			throw error;
		}
	}

	async extractLanguageItems(chapterText: string): Promise<{
		idioms: LanguageItemBase[];
		phrasalVerbs: LanguageItemBase[];
		rareWords: LanguageItemBase[];
	}> {
		console.log(
			`[GatewayAdapter] extract language items model=${this.model} textLength=${chapterText.length}`,
		);
		try {
			const { object, usage } = await generateObject({
				model: this.createGatewayModel(),
				schema: z.object({
					idioms: z.array(languageItemBaseSchema),
					phrasalVerbs: z.array(languageItemBaseSchema),
					rareWords: z.array(languageItemBaseSchema),
				}),
				system: LANGUAGE_ITEMS_SYSTEM_PROMPT,
				prompt: buildLanguageItemsPrompt(chapterText),
				maxOutputTokens: this.maxTokens,
				temperature: this.temperature,
				experimental_repairText: repairJsonText,
			});
			console.log(
				`[GatewayAdapter] extract language items done idioms=${object.idioms.length} phrasalVerbs=${object.phrasalVerbs.length} rareWords=${object.rareWords.length} tokens(in=${usage.inputTokens} out=${usage.outputTokens})`,
			);
			return object;
		} catch (error) {
			console.error('[GatewayAdapter] extract language items FAILED:', error);
			throw error;
		}
	}

	async extractIdioms(chapterText: string): Promise<LanguageItemBase[]> {
		return this.extractItems('idioms', IDIOMS_SYSTEM_PROMPT, chapterText);
	}

	async extractPhrasalVerbs(chapterText: string): Promise<LanguageItemBase[]> {
		return this.extractItems('phrasalVerbs', PHRASAL_VERBS_SYSTEM_PROMPT, chapterText);
	}

	async extractRareWords(chapterText: string): Promise<LanguageItemBase[]> {
		return this.extractItems('rareWords', RARE_WORDS_SYSTEM_PROMPT, chapterText);
	}

	async extractRarity(items: LanguageItemBase[]): Promise<LanguageItemScored[]> {
		console.log(
			`[GatewayAdapter] extract rarity model=${this.model} items=${items.length}`,
		);
		try {
			const { object, usage } = await generateObject({
				model: this.createGatewayModel(),
				schema: z.object({
					scores: z.array(z.object({
						index: z.number().int().min(0),
						rarity: z.number().int().min(0).max(10),
					})),
				}),
				system: RARITY_SYSTEM_PROMPT,
				prompt: buildRarityPrompt(items),
				maxOutputTokens: this.maxTokens,
				temperature: this.temperature,
				experimental_repairText: repairJsonText,
			});
			const rarityByIndex = new Map<number, number>();
			for (const score of object.scores) {
				rarityByIndex.set(score.index, score.rarity);
			}
			const enriched = items.map((item, index) => ({
				...item,
				rarity: rarityByIndex.get(index) ?? 5,
			}));
			console.log(
				`[GatewayAdapter] extract rarity done count=${enriched.length} tokens(in=${usage.inputTokens} out=${usage.outputTokens})`,
			);
			return enriched;
		} catch (error) {
			console.error('[GatewayAdapter] extract rarity FAILED:', error);
			throw error;
		}
	}

	async translateMeanings(
		items: LanguageItemScored[],
		language: keyof MeaningTranslations,
	): Promise<string[]> {
		console.log(
			`[GatewayAdapter] translate meanings language=${language} model=${this.model} items=${items.length}`,
		);
		try {
			const { object, usage } = await generateObject({
				model: this.createGatewayModel(),
				schema: z.object({
					translations: z.array(z.object({
						index: z.number().int().min(0),
						meaning: z.string(),
					})),
				}),
				system: buildMeaningSystemPrompt(language),
				prompt: buildMeaningPrompt(items, language),
				maxOutputTokens: this.maxTokens,
				temperature: this.temperature,
				experimental_repairText: repairJsonText,
			});
			const meaningByIndex = new Map<number, string>();
			for (const translation of object.translations) {
				meaningByIndex.set(translation.index, translation.meaning.trim());
			}
			const meanings = items.map(
				(item, index) => meaningByIndex.get(index) ?? item.term,
			);
			console.log(
				`[GatewayAdapter] translate meanings done language=${language} count=${meanings.length} tokens(in=${usage.inputTokens} out=${usage.outputTokens})`,
			);
			return meanings;
		} catch (error) {
			console.error(`[GatewayAdapter] translate meanings FAILED (${language}):`, error);
			throw error;
		}
	}

	private async extractItems(
		label: string,
		systemPrompt: string,
		chapterText: string,
	): Promise<LanguageItemBase[]> {
		console.log(
			`[GatewayAdapter] extract ${label} model=${this.model} textLength=${chapterText.length}`,
		);
		try {
			const { object, usage } = await generateObject({
				model: this.createGatewayModel(),
				schema: z.object({ items: z.array(languageItemBaseSchema) }),
				system: systemPrompt,
				prompt: buildItemsPrompt(chapterText),
				maxOutputTokens: this.maxTokens,
				temperature: this.temperature,
				experimental_repairText: repairJsonText,
			});
			console.log(
				`[GatewayAdapter] extract ${label} done count=${object.items.length} tokens(in=${usage.inputTokens} out=${usage.outputTokens})`,
			);
			return object.items;
		} catch (error) {
			console.error(`[GatewayAdapter] extract ${label} FAILED:`, error);
			throw error;
		}
	}
}
