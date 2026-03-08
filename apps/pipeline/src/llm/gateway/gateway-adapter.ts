import { createGateway, generateObject } from 'ai';

import type { LlmAdapter } from '../adapter';
import { chapterExtractionSchema, type ChapterExtraction } from '../schemas';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';

/**
 * Repair function for generateObject: when the model returns stringified
 * JSON arrays instead of actual arrays, parse them before Zod validation.
 */
async function repairJsonText({ text }: { text: string }): Promise<string | null> {
	try {
		const parsed = JSON.parse(text);
		let repaired = false;
		for (const key of ['idioms', 'phrasalVerbs', 'rareWords'] as const) {
			if (typeof parsed[key] === 'string') {
				parsed[key] = JSON.parse(parsed[key]);
				repaired = true;
			}
		}
		if (repaired) {
			console.log('[GatewayAdapter] repaired stringified array fields');
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
	gatewayUrl?: string;
	gatewayApiKey?: string;
}

export class GatewayAdapter implements LlmAdapter {
	private readonly model: string;
	private readonly maxTokens: number;
	private readonly gatewayUrl: string;
	private readonly gatewayApiKey: string;

	constructor(options: GatewayAdapterOptions) {
		this.model = options.model;
		this.maxTokens = options.maxTokens ?? 16384;
		this.gatewayUrl = options.gatewayUrl ?? AI_GATEWAY_URL;
		this.gatewayApiKey = options.gatewayApiKey ?? AI_GATEWAY_API_KEY;
	}

	async extractFromChapter(chapterText: string): Promise<ChapterExtraction> {
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

		console.log(
			`[GatewayAdapter] calling model=${this.model} maxOutputTokens=${this.maxTokens} textLength=${chapterText.length} via AI Gateway`,
		);

		const { object, usage } = await generateObject({
			model: gateway(this.model),
			schema: chapterExtractionSchema,
			system: SYSTEM_PROMPT,
			prompt: buildUserPrompt(chapterText),
			maxOutputTokens: this.maxTokens,
			experimental_repairText: repairJsonText,
		});

		console.log(
			`[GatewayAdapter] done — idioms=${object.idioms.length} phrasalVerbs=${object.phrasalVerbs.length} rareWords=${object.rareWords.length}` +
				` tokens(in=${usage.inputTokens} out=${usage.outputTokens})`,
		);

		return object;
	}
}
