import { getDb } from '../mongodb';
import type { GatewayConfig, LlmConfig } from '../types/llm-config';
import { DEFAULT_LLM_CONFIG } from '../types/llm-config';

const COLLECTION = 'llmConfig';
const SINGLETON_ID = 'singleton';

function legacyModelToGatewayId(model: string): string {
	if (model.includes('/')) return model;
	const normalized = model.replace(/-(\d)-(\d)(?:-\d+)?$/, '-$1.$2');
	return `anthropic/${normalized}`;
}

export async function getLlmConfig(): Promise<LlmConfig> {
	const db = await getDb();
	const doc = await db
		.collection<LlmConfig & { _id: string; adapter?: string; claude?: { model: string; maxTokens: number }; gateway?: GatewayConfig }>(COLLECTION)
		.findOne({ _id: SINGLETON_ID });
	if (doc === null) {
		return DEFAULT_LLM_CONFIG;
	}
	const { _id: _, ...raw } = doc;
	if (raw.adapter === 'claude' && raw.claude) {
		return {
			adapter: 'gateway',
			gateway: {
				model: legacyModelToGatewayId(raw.claude.model),
				maxTokens: raw.claude.maxTokens,
			},
		};
	}
	if (raw.adapter === 'gateway' && raw.gateway) {
		return raw as LlmConfig;
	}
	return DEFAULT_LLM_CONFIG;
}

export async function saveLlmConfig(config: LlmConfig): Promise<void> {
	const db = await getDb();
	await db
		.collection<LlmConfig & { _id: string }>(COLLECTION)
		.updateOne(
			{ _id: SINGLETON_ID },
			{ $set: { ...config, _id: SINGLETON_ID } },
			{ upsert: true },
		);
}
