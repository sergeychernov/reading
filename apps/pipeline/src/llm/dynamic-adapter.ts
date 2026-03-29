import { MongoClient } from 'mongodb';
import type { LlmAdapter } from '@reading/jobs';
import { StubAdapter, GatewayAdapter } from '@reading/jobs';
import type { LanguageItemBase, LanguageItemScored, MeaningTranslations, RareWordItem } from '@reading/llm-schemas';

interface GatewayConfig {
	model: string;
	maxTokens: number;
	temperature?: number;
}

interface LlmConfig {
	default: LlmAdapterConfig;
	jobs?: Partial<Record<LlmJobName, LlmAdapterConfig>>;
}

interface LlmAdapterConfig {
	adapter: 'gateway' | 'stub';
	gateway: GatewayConfig;
}

type LlmJobName =
	| 'extract-summary'
	| 'extract-idioms'
	| 'extract-phrasal-verbs'
	| 'extract-rare-words'
	| 'extract-rarity'
	| 'extract-meaning-en'
	| 'extract-meaning-ru';

interface LegacyLlmConfig {
	adapter: 'gateway' | 'stub';
	gateway: GatewayConfig;
}

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'reading';
const COLLECTION = 'llmConfig';
const SINGLETON_ID = 'singleton';

const DEFAULT_CONFIG: LlmConfig = {
	default: {
		adapter: 'stub',
		gateway: {
			model: 'anthropic/claude-sonnet-4.6',
			maxTokens: 16384,
			temperature: 0.2,
		},
	},
	jobs: {},
};

function isAdapterConfig(value: unknown): value is LlmAdapterConfig {
	if (typeof value !== 'object' || value === null) return false;
	const candidate = value as Partial<LlmAdapterConfig>;
	if (candidate.adapter !== 'gateway' && candidate.adapter !== 'stub') return false;
	if (typeof candidate.gateway !== 'object' || candidate.gateway === null) return false;
	return true;
}

function normalizeLlmConfig(raw: unknown): LlmConfig {
	if (typeof raw !== 'object' || raw === null) {
		return DEFAULT_CONFIG;
	}

	const candidate = raw as Partial<LlmConfig>;
	if (isAdapterConfig(candidate.default)) {
		return {
			default: candidate.default,
			jobs: candidate.jobs ?? {},
		};
	}

	const legacy = raw as Partial<LegacyLlmConfig>;
	if (legacy.adapter === 'gateway' || legacy.adapter === 'stub') {
		return {
			default: {
				adapter: legacy.adapter,
				gateway: legacy.gateway ?? DEFAULT_CONFIG.default.gateway,
			},
			jobs: {},
		};
	}

	return DEFAULT_CONFIG;
}

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
		return normalizeLlmConfig(config);
	} finally {
		await client.close();
	}
}

function createAdapterFromConfig(config: LlmAdapterConfig): LlmAdapter {
	if (config.adapter === 'gateway') {
		const temp = config.gateway.temperature ?? 0.2;
		console.log(
			`[DynamicAdapter] adapter=gateway model=${config.gateway.model} maxTokens=${config.gateway.maxTokens} temperature=${temp}`,
		);
		return new GatewayAdapter({
			model: config.gateway.model,
			maxTokens: config.gateway.maxTokens,
			temperature: temp,
		});
	}
	console.log('[DynamicAdapter] adapter=stub');
	return new StubAdapter();
}

function getConfigForJob(config: LlmConfig, jobName: LlmJobName): LlmAdapterConfig {
	return config.jobs?.[jobName] ?? config.default;
}

/**
 * Reads the active LLM adapter config from MongoDB on every call.
 * This ensures config changes made in the admin panel take effect immediately
 * without restarting the pipeline server.
 */
export class DynamicAdapter implements LlmAdapter {
	private async getAdapter(jobName: LlmJobName): Promise<LlmAdapter> {
		console.log('[DynamicAdapter] reading config from MongoDB…');
		const config = await readLlmConfig();
		return createAdapterFromConfig(getConfigForJob(config, jobName));
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
		const jobName = language === 'ru' ? 'extract-meaning-ru' : 'extract-meaning-en';
		return (await this.getAdapter(jobName)).translateMeanings(items, language);
	}
}
