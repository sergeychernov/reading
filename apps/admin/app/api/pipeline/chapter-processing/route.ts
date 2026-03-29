import { createPipelineRouteHandler } from 'neuroline-nextjs';
import { waitUntil } from '@vercel/functions';
import { ObjectId } from 'mongodb';
import {
	getDb,
	getChapterById,
} from '@reading/data';
import { getNeuroline } from '../../../../lib/neuroline';
import { chapterProcessingPipeline } from '../../../pipelines/chapter-processing.pipeline';

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
		pipeline: chapterProcessingPipeline,
		enableDebugEndpoints: true,
		waitUntil: process.env.VERCEL
			? (promise) => waitUntil(promise)
			: undefined,
	});

	return handlers;
}

export async function GET(request: Request): Promise<Response> {
	const h = await getHandlers();
	return h.GET(request);
}

interface StartChapterPipelineBody {
	chapterId: string;
}

function parseStartPayload(value: unknown): StartChapterPipelineBody | null {
	if (value == null || typeof value !== 'object') {
		return null;
	}
	const raw = value as Partial<StartChapterPipelineBody>;
	const chapterId = typeof raw.chapterId === 'string' ? raw.chapterId.trim() : '';
	if (!chapterId || !ObjectId.isValid(chapterId)) {
		return null;
	}
	return { chapterId };
}

export async function POST(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const action = url.searchParams.get('action');

	// Delegate neuroline-managed actions (retry, runManualJob, etc.) directly.
	if (action) {
		const h = await getHandlers();
		return h.POST(request);
	}

	const payloadRaw = await request.json().catch(() => null);
	const payload = parseStartPayload(payloadRaw);
	if (!payload) {
		return Response.json(
			{
				error: 'Invalid payload. chapterId (Mongo ObjectId) is required.',
			},
			{ status: 400 },
		);
	}

	const db = await getDb();
	const chapter = await getChapterById(db, payload.chapterId);
	if (!chapter) {
		return Response.json({ error: 'Chapter not found' }, { status: 404 });
	}
	if (chapter.processingStatus !== 'pending') {
		return Response.json(
			{ error: 'Pipeline can only be started for chapters with pending status' },
			{ status: 400 },
		);
	}

	const h = await getHandlers();
	const startRequest = new Request(request.url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	const startResponse = await h.POST(startRequest);
	if (!startResponse.ok) {
		return startResponse;
	}

	const startResponseJson = await startResponse.clone().json().catch(() => null) as
		| { data?: { pipelineId?: string; isNew?: boolean } }
		| null;
	const pipelineId = startResponseJson?.data?.pipelineId;
	const isNew = startResponseJson?.data?.isNew;

	// Existing pipelines are deduplicated by hash; force rerun from the first job.
	if (typeof pipelineId !== 'string' || pipelineId.length === 0 || isNew !== false) {
		return startResponse;
	}

	const retryUrl = new URL(request.url);
	retryUrl.searchParams.set('action', 'retry');
	retryUrl.searchParams.set('id', pipelineId);

	const retryRequest = new Request(retryUrl.toString(), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ jobName: 'start-chapter-processing' }),
	});
	return h.POST(retryRequest);
}
