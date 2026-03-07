import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPipelineConfig, savePipelineConfig } from '../../../../lib/db/pipeline-config';

export const runtime = 'nodejs';

const pipelineConfigSchema = z.object({
	autoDispatchChapters: z.boolean(),
});

export async function GET(): Promise<NextResponse> {
	try {
		const config = await getPipelineConfig();
		return NextResponse.json(config);
	} catch (error) {
		console.error('Failed to fetch pipeline config:', error);
		return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
	}
}

export async function PUT(request: Request): Promise<NextResponse> {
	try {
		const body: unknown = await request.json();
		const config = pipelineConfigSchema.parse(body);
		await savePipelineConfig(config);
		return NextResponse.json(config);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: error.flatten() }, { status: 422 });
		}
		console.error('Failed to save pipeline config:', error);
		return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
	}
}
