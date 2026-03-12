import { NextResponse } from 'next/server';
import { getDb, getChapterById, updateChapterStatus } from '@reading/data';
import { requireSubscription } from '../../../../../../../lib/auth/require-subscription';

export const runtime = 'nodejs';

interface RouteParams {
	params: Promise<{ bookId: string; chapterId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams): Promise<NextResponse> {
	const authResult = await requireSubscription();
	if (authResult instanceof NextResponse) return authResult;

	const { bookId, chapterId } = await params;

	const db = await getDb();
	const chapter = await getChapterById(db, chapterId);
	if (!chapter) {
		return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
	}

	// Reset status BEFORE triggering the pipeline so the client polling does not
	// mistake the previous `completed` state for the new run completing.
	await updateChapterStatus(db, chapterId, 'pending');

	const pipelineUrl = process.env.PIPELINE_API_URL ?? 'http://localhost:3001';
	const pipelineSecret = process.env.PIPELINE_API_SECRET;
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	if (pipelineSecret) headers['x-internal-secret'] = pipelineSecret;

	const pipelineResponse = await fetch(`${pipelineUrl}/api/v1/chapter-extraction`, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			bookId,
			chapterId,
			chapterIndex: chapter.chapterIndex,
			chapterTitle: chapter.title,
			chapterText: chapter.rawText,
		}),
	});

	if (!pipelineResponse.ok) {
		const body = await pipelineResponse.text().catch(() => '');
		console.error('Pipeline reprocess failed:', pipelineResponse.status, body);
		await updateChapterStatus(db, chapterId, chapter.processingStatus);
		return NextResponse.json({ error: 'Failed to start reprocessing' }, { status: 502 });
	}

	return NextResponse.json({ status: 'reprocessing' }, { status: 202 });
}
