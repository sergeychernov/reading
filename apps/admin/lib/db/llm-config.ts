import { getDb } from '@reading/data';
import type { LlmAdapterConfig, LlmConfig } from '../types/llm-config';
import { DEFAULT_LLM_CONFIG, LLM_JOB_NAMES } from '../types/llm-config';

const COLLECTION = 'llmConfig';
const SINGLETON_ID = 'singleton';

interface LegacyLlmConfig {
	adapter: 'gateway' | 'stub';
	gateway: LlmAdapterConfig['gateway'];
}

function isAdapterConfig(value: unknown): value is LlmAdapterConfig {
	if (typeof value !== 'object' || value === null) return false;
	const candidate = value as Partial<LlmAdapterConfig>;
	if (candidate.adapter !== 'gateway' && candidate.adapter !== 'stub') return false;
	if (typeof candidate.gateway !== 'object' || candidate.gateway === null) return false;
	return true;
}

function normalizeLlmConfig(raw: unknown): LlmConfig {
	if (typeof raw !== 'object' || raw === null) {
		return DEFAULT_LLM_CONFIG;
	}

	const candidate = raw as Partial<LlmConfig>;
	if (isAdapterConfig(candidate.default)) {
		const jobs: LlmConfig['jobs'] = {};
		for (const jobName of LLM_JOB_NAMES) {
			const jobConfig = candidate.jobs?.[jobName];
			if (isAdapterConfig(jobConfig)) {
				jobs[jobName] = jobConfig;
			}
		}
		return {
			default: candidate.default,
			jobs,
		};
	}

	const legacy = raw as Partial<LegacyLlmConfig>;
	if (legacy.adapter === 'gateway' || legacy.adapter === 'stub') {
		return {
			default: {
				adapter: legacy.adapter,
				gateway: legacy.gateway ?? DEFAULT_LLM_CONFIG.default.gateway,
			},
			jobs: {},
		};
	}

	return DEFAULT_LLM_CONFIG;
}

export async function getLlmConfig(): Promise<LlmConfig> {
	const db = await getDb();
	const doc = await db
		.collection<LlmConfig & { _id: string }>(COLLECTION)
		.findOne({ _id: SINGLETON_ID });
	if (doc === null) {
		return DEFAULT_LLM_CONFIG;
	}
	const { _id: _, ...config } = doc;
	return normalizeLlmConfig(config);
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
