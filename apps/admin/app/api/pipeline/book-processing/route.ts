import { createPipelineRouteHandler } from 'neuroline-nextjs';
import { getNeuroline } from '../../../../lib/neuroline';
import { bookProcessingPipeline } from '../../../pipelines/book-processing.pipeline';

export const runtime = 'nodejs';

let handlers: ReturnType<typeof createPipelineRouteHandler> | null = null;

async function getHandlers() {
	if (handlers) {
		return handlers;
	}

	const { manager, storage } = await getNeuroline();
	handlers = createPipelineRouteHandler({
		manager,
		storage,
		pipeline: bookProcessingPipeline,
		enableDebugEndpoints: true,
	});

	return handlers;
}

export async function GET(request: Request): Promise<Response> {
	const h = await getHandlers();
	return h.GET(request);
}

export async function POST(request: Request): Promise<Response> {
	const h = await getHandlers();
	return h.POST(request);
}
