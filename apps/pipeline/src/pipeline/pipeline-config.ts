import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'reading';
const COLLECTION = 'pipelineConfig';
const SINGLETON_ID = 'singleton';

export interface PipelineConfig {
	autoDispatchChapters: boolean;
}

const DEFAULT_CONFIG: PipelineConfig = {
	autoDispatchChapters: false,
};

/**
 * Reads pipeline behaviour config from MongoDB on every call.
 * Changes made in the admin panel take effect immediately without a server restart.
 */
export async function readPipelineConfig(): Promise<PipelineConfig> {
	const client = new MongoClient(MONGODB_URI);
	try {
		await client.connect();
		const doc = await client
			.db(DB_NAME)
			.collection<PipelineConfig & { _id: string }>(COLLECTION)
			.findOne({ _id: SINGLETON_ID });

		if (doc === null) {
			return DEFAULT_CONFIG;
		}

		const { _id: _, ...config } = doc;
		return {
			autoDispatchChapters: config.autoDispatchChapters ?? DEFAULT_CONFIG.autoDispatchChapters,
		};
	} finally {
		await client.close();
	}
}
