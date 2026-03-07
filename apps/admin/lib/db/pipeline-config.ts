import { getDb } from '../mongodb';

const COLLECTION = 'pipelineConfig';
const SINGLETON_ID = 'singleton';

export interface PipelineConfig {
	autoDispatchChapters: boolean;
}

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
	autoDispatchChapters: false,
};

export async function getPipelineConfig(): Promise<PipelineConfig> {
	const db = await getDb();
	const doc = await db
		.collection<PipelineConfig & { _id: string }>(COLLECTION)
		.findOne({ _id: SINGLETON_ID });

	if (doc === null) {
		return DEFAULT_PIPELINE_CONFIG;
	}

	const { _id: _, ...config } = doc;
	return {
		autoDispatchChapters: config.autoDispatchChapters ?? DEFAULT_PIPELINE_CONFIG.autoDispatchChapters,
	};
}

export async function savePipelineConfig(config: PipelineConfig): Promise<void> {
	const db = await getDb();
	await db
		.collection<PipelineConfig & { _id: string }>(COLLECTION)
		.updateOne(
			{ _id: SINGLETON_ID },
			{ $set: { ...config, _id: SINGLETON_ID } },
			{ upsert: true },
		);
}
