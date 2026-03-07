import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getLlmConfig, saveLlmConfig } from '../../../lib/db/llm-config';

export const runtime = 'nodejs';

const llmConfigSchema = z.object({
	adapter: z.enum(['gateway', 'stub']),
	gateway: z.object({
		model: z.string().min(1),
		maxTokens: z.number().int().min(256).max(16384),
	}),
});

export async function GET(): Promise<NextResponse> {
	try {
		const config = await getLlmConfig();
		return NextResponse.json(config);
	} catch (error) {
		console.error('Failed to fetch LLM config:', error);
		return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
	}
}

export async function PUT(request: Request): Promise<NextResponse> {
	try {
		const body: unknown = await request.json();
		const config = llmConfigSchema.parse(body);
		await saveLlmConfig(config);
		return NextResponse.json(config);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: error.flatten() }, { status: 422 });
		}
		console.error('Failed to save LLM config:', error);
		return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
	}
}
