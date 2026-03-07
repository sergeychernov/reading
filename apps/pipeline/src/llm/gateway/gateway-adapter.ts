import { createGateway, generateObject } from 'ai';

import type { LlmAdapter } from '../adapter';
import { chapterExtractionSchema, type ChapterExtraction } from '../schemas';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';

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
		this.maxTokens = options.maxTokens ?? 4096;
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
		});

		console.log(
			`[GatewayAdapter] done — idioms=${object.idioms.length} phrasalVerbs=${object.phrasalVerbs.length} rareWords=${object.rareWords.length}` +
				` tokens(in=${usage.inputTokens} out=${usage.outputTokens})`,
		);

		return object;
	}
}
