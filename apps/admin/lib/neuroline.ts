import mongoose from 'mongoose';
import { PipelineManager } from 'neuroline';
import { MongoPipelineStorage, PipelineSchema } from 'neuroline/mongo';

const MONGODB_URI = process.env.MONGODB_URI ?? '';

let cached: { manager: PipelineManager; storage: MongoPipelineStorage } | null = null;

export async function getNeuroline() {
	if (cached) {
		return cached;
	}

	if (!MONGODB_URI) {
		throw new Error('MONGODB_URI is not set');
	}

	if (mongoose.connection.readyState === 0) {
		await mongoose.connect(MONGODB_URI, { dbName: 'reading' });
	}

	const PipelineModel =
		mongoose.models.Pipeline ?? mongoose.model('Pipeline', PipelineSchema);

	const storage = new MongoPipelineStorage(PipelineModel);
	const manager = new PipelineManager({ storage });

	cached = { manager, storage };
	return cached;
}
