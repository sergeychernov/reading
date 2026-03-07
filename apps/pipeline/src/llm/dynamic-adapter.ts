import { MongoClient } from 'mongodb';
import type { LlmAdapter } from './adapter';
import type { ChapterExtraction } from './schemas';
import { StubAdapter } from './stub-adapter';
import { GatewayAdapter } from './gateway/gateway-adapter';

interface GatewayConfig {
	model: string;
	maxTokens: number;
}

interface LlmConfig {
	adapter: 'gateway' | 'stub';
	gateway: GatewayConfig;
}

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'reading';
const COLLECTION = 'llmConfig';
const SINGLETON_ID = 'singleton';

const DEFAULT_CONFIG: LlmConfig = {
	adapter: 'stub',
	gateway: {
		model: 'anthropic/claude-sonnet-4.6',
		maxTokens: 4096,
	},
};

async function readLlmConfig(): Promise<LlmConfig> {
	const client = new MongoClient(MONGODB_URI);
	try {
		await client.connect();
		const doc = await client
			.db(DB_NAME)
			.collection<LlmConfig & { _id: string }>(COLLECTION)
			.findOne({ _id: SINGLETON_ID });
		if (doc === null) {
			console.log('[DynamicAdapter] no config in DB, using default (stub)');
			return DEFAULT_CONFIG;
		}
		const { _id: _, ...config } = doc;
		if (config.adapter === 'gateway' && config.gateway) {
			return config;
		}
		return DEFAULT_CONFIG;
	} finally {
		await client.close();
	}
}

function createAdapterFromConfig(config: LlmConfig): LlmAdapter {
	if (config.adapter === 'gateway') {
		console.log(
			`[DynamicAdapter] adapter=gateway model=${config.gateway.model} maxTokens=${config.gateway.maxTokens}`,
		);
		return new GatewayAdapter({
			model: config.gateway.model,
			maxTokens: config.gateway.maxTokens,
		});
	}
	console.log('[DynamicAdapter] adapter=stub');
	return new StubAdapter();
}

/**
 * Reads the active LLM adapter config from MongoDB on every call.
 * This ensures config changes made in the admin panel take effect immediately
 * without restarting the pipeline server.
 */
export class DynamicAdapter implements LlmAdapter {
	async extractFromChapter(chapterText: string): Promise<ChapterExtraction> {
		console.log('[DynamicAdapter] reading config from MongoDB…');
		const config = await readLlmConfig();
		const adapter = createAdapterFromConfig(config);
		return adapter.extractFromChapter(chapterText);
	}
}
