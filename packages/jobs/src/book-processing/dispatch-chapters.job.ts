import type { JobDefinition, JobContext } from 'neuroline';
import type { PipelineConfig } from '../types';
import type { SaveChaptersOutput } from './save-chapters.job';

export interface DispatchChaptersInput {
	bookId: string;
	chapters: Array<{
		chapterId: string;
		index: number;
		title: string;
		text: string;
	}>;
}

export interface DispatchChaptersOutput {
	dispatched: number;
	errors: number;
	skipped?: boolean;
}

export interface DispatchChaptersOptions {
	readPipelineConfig: () => Promise<PipelineConfig>;
	pipelineBaseUrl?: string;
	pipelineApiSecret?: string;
}

const DEFAULT_BASE_URL = 'http://localhost:3001';

/**
 * Fan-out job: starts one chapter-extraction pipeline per chapter via HTTP.
 *
 * Checks the `autoDispatchChapters` flag via readPipelineConfig before dispatching.
 * If disabled, exits early without making any HTTP calls.
 * Uses Promise.allSettled to fire all requests concurrently (fire-and-forget).
 */
export function createDispatchChaptersJob(options: DispatchChaptersOptions): JobDefinition {
	const baseUrl = options.pipelineBaseUrl ?? process.env.PIPELINE_BASE_URL ?? DEFAULT_BASE_URL;
	const secret = options.pipelineApiSecret ?? process.env.PIPELINE_API_SECRET;

	return {
		name: 'dispatch-chapters',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<DispatchChaptersOutput> {
			const input = rawInput as DispatchChaptersInput;

			const pipelineConfig = await options.readPipelineConfig();

			if (!pipelineConfig.autoDispatchChapters) {
				context.logger.info(
					'autoDispatchChapters is disabled — skipping chapter dispatch',
				);
				return { dispatched: 0, errors: 0, skipped: true };
			}

			const url = `${baseUrl}/api/v1/chapter-extraction`;

			context.logger.info(
				`Dispatching ${input.chapters.length} chapter pipelines to ${url}`,
			);

			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (secret) headers['x-internal-secret'] = secret;

			const results = await Promise.allSettled(
				input.chapters.map(async (chapter) => {
					const response = await fetch(url, {
						method: 'POST',
						headers,
						body: JSON.stringify({
							bookId: input.bookId,
							chapterId: chapter.chapterId,
							chapterIndex: chapter.index,
							chapterTitle: chapter.title,
							chapterText: chapter.text,
						}),
					});

					if (!response.ok) {
						const body = await response.text().catch(() => '');
						throw new Error(
							`Failed to dispatch chapter ${chapter.index}: ${response.status} ${body}`,
						);
					}

					return response.json();
				}),
			);

			let dispatched = 0;
			let errors = 0;

			for (const result of results) {
				if (result.status === 'fulfilled') {
					dispatched++;
				} else {
					errors++;
					context.logger.error(`Dispatch error: ${result.reason}`);
				}
			}

			context.logger.info(`Dispatched: ${dispatched}, errors: ${errors}`);

			if (dispatched === 0 && input.chapters.length > 0) {
				throw new Error('Failed to dispatch any chapter pipelines');
			}

			return { dispatched, errors };
		},
	};
}
