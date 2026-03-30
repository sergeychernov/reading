import { createGateway, generateObject, generateText } from 'ai';
import { z } from 'zod';
import type { LanguageItemBase, LanguageItemScored, MeaningTranslations, RareWordItem } from '@reading/llm-schemas';
import { idiomItemSchema, phrasalVerbItemSchema, rareWordItemSchema } from '@reading/llm-schemas';
import type { ItemCategory, LlmAdapter } from '../types';

const BASE_SYSTEM_PROMPT =
	'You are an English language tutor assistant. ' +
	'Your task is to analyze a chapter from an English book and extract language learning material for B1-B2 level learners. ' +
	'Be thorough but selective — only include items that genuinely help a learner expand their vocabulary and understanding.';

const SUMMARY_SYSTEM_PROMPT =
	'You are an English language tutor assistant. ' +
	'Write a brief summary of the given book chapter in simple English, 3-5 sentences. ' +
	'Cover only the main plot events or ideas. ' +
	'Do NOT include vocabulary lists, idioms, word definitions, or any language learning material — plain narrative summary only.';

const IDIOMS_SYSTEM_PROMPT =
	BASE_SYSTEM_PROMPT +
	' Extract all idiomatic expressions (idioms) found in the chapter.' +
	' An idiom is a fixed multi-word phrase whose meaning cannot be deduced from the individual words (e.g. "break the ice", "once in a blue moon").' +
	' Do NOT include single words, rare vocabulary, or phrasal verbs — those are handled separately.' +
	' Normalize the term to its canonical dictionary form: use "someone" (not "somebody" or "smb"), use infinitive for verbs (e.g. "break the ice", not "broke the ice").' +
	' The same idiom must always appear with the exact same term spelling across all chapters.';

const PHRASAL_VERBS_SYSTEM_PROMPT =
	BASE_SYSTEM_PROMPT +
	' Extract all phrasal verbs found in the chapter.' +
	' A phrasal verb is a verb combined with one or two particles (preposition or adverb) that together form a new meaning (e.g. "give up", "run into", "run out").' +
	' Allowed particles are strictly limited to: about, across, after, along, around, aside, away, back, by, down, for, forward, in, into, off, on, out, over, round, through, together, under, up.' +
	' "to" is NOT an allowed particle for this task; never extract verb + to combinations (e.g. "screech to a halt", "turn to look").' +
	' The verb + particle combination must be the core unit — do NOT include fixed multi-word expressions or idioms (e.g. "seize hold of", "make the most of" are idioms, not phrasal verbs).' +
	' Do NOT include bare verbs without a particle, and do NOT include nouns or adjectives.' +
	' Do NOT include verb + noun collocations or transitive combinations (e.g. "cut costs", "cast a shadow", "clear his throat").' +
	' Do NOT include verb + possessive pronoun + noun patterns (my/your/his/her/its/our/their + noun), e.g. "clear his throat", "pat my pocket".' +
	' Normalize the term to its base (infinitive) form without a subject (e.g. "give up", not "gave up" or "giving up").' +
	' The same phrasal verb must always appear with the exact same term spelling across all chapters.';

const RARE_WORDS_SYSTEM_PROMPT =
	BASE_SYSTEM_PROMPT +
	' Extract all uncommon single words (rare words) that a B1-B2 learner might not know.' +
	' Only include individual words — do NOT include multi-word expressions, phrases, compound nouns, medical/psychological terms, or proper nouns.' +
	' Normalize the term to its base dictionary form: singular for nouns (e.g. "impulse", not "impulses"), infinitive for verbs (e.g. "wither", not "withered").' +
	' The same word must always appear with the exact same term spelling across all chapters.';

const RARITY_SYSTEM_PROMPT =
	'You are an English linguistics assistant. ' +
	'Your task is to assign a rarity score from 0 to 10 for each provided English language item. ' +
	'0 means extremely common in everyday English. 10 means very rare or obscure. ' +
	'Return a JSON object with "scores": an array of objects with exact keys "index" and "rarity". ' +
	'Keep the same order by using the given index values. ' +
	'Do not skip any index.';

function buildMeaningSystemPrompt(language: 'en' | 'ru', category: ItemCategory): string {
	const categoryInstruction = buildCategoryInstruction(language, category);

	return (
		'You are an English language tutor assistant. ' +
		categoryInstruction +
		'Return a JSON object with "translations": an array of objects with exact keys "index" and "meaning". ' +
		'Do not skip any index. Do not return alternatives.'
	);
}

function buildCategoryInstruction(language: 'en' | 'ru', category: ItemCategory): string {
	const languageName = language === 'en' ? 'English' : 'Russian';

	if (category === 'idiom') {
		if (language === 'ru') {
			return (
				'Each item is an English idiom. ' +
				'For each idiom provide a well-known equivalent Russian idiom, proverb, or set phrase that carries the same figurative meaning. ' +
				'If no established Russian idiom exists, give a short idiomatic Russian paraphrase of the figurative meaning — NEVER translate the words literally. ' +
				'Use dictionary form: verbs in the infinitive, nouns in the nominative singular. '
			);
		}
		return (
			'Each item is an English idiom. ' +
			'Provide a concise English explanation of the figurative meaning — do NOT restate the literal words. ' +
			'Give each meaning in dictionary form: verbs in the bare infinitive, nouns in the singular. '
		);
	}

	if (category === 'phrasal-verb') {
		const dictionaryForm =
			language === 'ru'
				? 'Give each meaning in dictionary form: verbs in the infinitive, nouns in the nominative singular, adjectives in the masculine nominative singular.'
				: 'Give each meaning in dictionary form: verbs in the bare infinitive, nouns in the singular.';
		return (
			'Each item is an English phrasal verb. ' +
			`Provide one concise and context-aware ${languageName} meaning for the phrasal verb as used in the given sentence. ` +
			`${dictionaryForm} `
		);
	}

	const dictionaryForm =
		language === 'ru'
			? 'Give each meaning in dictionary form: verbs in the infinitive, nouns in the nominative singular, adjectives in the masculine nominative singular.'
			: 'Give each meaning in dictionary form: verbs in the bare infinitive, nouns in the singular.';
	return (
		`Your task is to provide one concise and context-aware ${languageName} meaning for each given word. ` +
		'Use the sentence from the book to pick exactly one best meaning for that context. ' +
		`${dictionaryForm} `
	);
}

function buildItemsPrompt(chapterText: string): string {
	return `Extract from the following chapter text. Return json.\n\n${chapterText}`;
}

async function repairJsonText({ text }: { text: string }): Promise<string | null> {
	try {
		const parsed = JSON.parse(text);
		for (const key of ['items', 'scores', 'translations'] as const) {
			if (typeof parsed[key] === 'string') {
				parsed[key] = JSON.parse(parsed[key]);
				return JSON.stringify(parsed);
			}
		}
		let repairedLists = false;
		for (const key of ['idioms', 'phrasalVerbs', 'rareWords'] as const) {
			if (typeof parsed[key] === 'string') {
				parsed[key] = JSON.parse(parsed[key]);
				repairedLists = true;
			}
		}
		if (repairedLists) {
			return JSON.stringify(parsed);
		}
	} catch {
		// nothing to repair
	}
	return null;
}

export interface GatewayAdapterOptions {
	model: string;
	maxTokens?: number;
	temperature?: number;
}

export class GatewayAdapter implements LlmAdapter {
	private readonly model: string;
	private readonly maxTokens: number;
	private readonly temperature: number;

	constructor(options: GatewayAdapterOptions) {
		this.model = options.model;
		this.maxTokens = options.maxTokens ?? 16384;
		this.temperature = options.temperature ?? 0.2;
	}

	private createModel() {
		const apiKey = process.env.AI_GATEWAY_API_KEY;
		if (!apiKey) {
			throw new Error(
				'AI_GATEWAY_API_KEY is not set. ' +
				'Add it to .env.local (see .env.example).',
			);
		}
		const gateway = createGateway({ apiKey });
		return gateway(this.model);
	}

	async extractSummary(chapterText: string): Promise<string> {
		console.log(
			`[GatewayAdapter] extractSummary model=${this.model} textLength=${chapterText.length}`,
		);
		try {
			const { text, usage } = await generateText({
				model: this.createModel(),
				system: SUMMARY_SYSTEM_PROMPT,
				prompt: `Summarize the following chapter. Return plain text only, no headers, no bullet points.\n\n${chapterText}`,
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

	async extractIdioms(chapterText: string): Promise<LanguageItemBase[]> {
		return this.extractItems(IDIOMS_SYSTEM_PROMPT, chapterText, idiomItemSchema);
	}

	async extractPhrasalVerbs(chapterText: string): Promise<LanguageItemBase[]> {
		return this.extractItems(PHRASAL_VERBS_SYSTEM_PROMPT, chapterText, phrasalVerbItemSchema);
	}

	async extractRareWords(chapterText: string): Promise<RareWordItem[]> {
		return this.extractItems(RARE_WORDS_SYSTEM_PROMPT, chapterText, rareWordItemSchema);
	}

	async extractRarity(items: LanguageItemBase[]): Promise<LanguageItemScored[]> {
		console.log(
			`[GatewayAdapter] extractRarity model=${this.model} items=${items.length}`,
		);
		try {
			const { object, usage } = await generateObject({
				model: this.createModel(),
				schema: z.object({
					scores: z.array(z.object({
						index: z.number().int().min(0),
						rarity: z.number().int().min(0).max(10),
					})),
				}),
				system: RARITY_SYSTEM_PROMPT,
				prompt: items.map((item, i) => `${i}. "${item.term}" — "${item.exampleFromBook}"`).join('\n'),
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
				`[GatewayAdapter] extractRarity done count=${enriched.length} tokens(in=${usage.inputTokens} out=${usage.outputTokens})`,
			);
			return enriched;
		} catch (error) {
			console.error('[GatewayAdapter] extractRarity FAILED:', error);
			throw error;
		}
	}

	async translateMeanings(
		items: LanguageItemScored[],
		language: keyof MeaningTranslations,
		category: ItemCategory,
	): Promise<string[]> {
		console.log(
			`[GatewayAdapter] translateMeanings language=${language} category=${category} model=${this.model} items=${items.length}`,
		);
		try {
			const { object, usage } = await generateObject({
				model: this.createModel(),
				schema: z.object({
					translations: z.array(z.object({
						index: z.number().int().min(0),
						meaning: z.string(),
					})),
				}),
				system: buildMeaningSystemPrompt(language, category),
				prompt: items.map((item, i) => `${i}. "${item.term}" — "${item.exampleFromBook}"`).join('\n'),
				maxOutputTokens: this.maxTokens,
				temperature: this.temperature,
				experimental_repairText: repairJsonText,
			});
			const meaningByIndex = new Map<number, string>();
			for (const t of object.translations) {
				meaningByIndex.set(t.index, t.meaning.trim());
			}
			const meanings = items.map((item, index) => meaningByIndex.get(index) ?? item.term);
			console.log(
				`[GatewayAdapter] translateMeanings done language=${language} count=${meanings.length} tokens(in=${usage.inputTokens} out=${usage.outputTokens})`,
			);
			return meanings;
		} catch (error) {
			console.error(`[GatewayAdapter] translateMeanings FAILED (${language}):`, error);
			throw error;
		}
	}

	private async extractItems<T extends LanguageItemBase>(
		systemPrompt: string,
		chapterText: string,
		itemSchema: z.ZodType<T>,
	): Promise<T[]> {
		console.log(
			`[GatewayAdapter] extractItems model=${this.model} textLength=${chapterText.length}`,
		);
		try {
			const { object, usage } = await generateObject({
				model: this.createModel(),
				schema: z.object({ items: z.array(itemSchema) }),
				system: systemPrompt,
				prompt: buildItemsPrompt(chapterText),
				maxOutputTokens: this.maxTokens,
				temperature: this.temperature,
				experimental_repairText: repairJsonText,
			});
			console.log(
				`[GatewayAdapter] extractItems done count=${object.items.length} tokens(in=${usage.inputTokens} out=${usage.outputTokens})`,
			);
			return object.items;
		} catch (error) {
			console.error('[GatewayAdapter] extractItems FAILED:', error);
			throw error;
		}
	}
}
