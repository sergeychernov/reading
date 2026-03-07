import { getDb } from '../mongodb';
import type { LlmConfig } from '../types/llm-config';
import { DEFAULT_LLM_CONFIG } from '../types/llm-config';

const COLLECTION = 'llmConfig';
const SINGLETON_ID = 'singleton';

export async function getLlmConfig(): Promise<LlmConfig> {
	const db = await getDb();
	const doc = await db
		.collection<LlmConfig & { _id: string }>(COLLECTION)
		.findOne({ _id: SINGLETON_ID });
	if (doc === null) {
		return DEFAULT_LLM_CONFIG;
	}
	const { _id: _, ...config } = doc;
	if (config.adapter === 'gateway' && config.gateway) {
		return config;
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
