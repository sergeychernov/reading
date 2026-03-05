import type { JobDefinition, JobContext } from 'neuroline';

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
}

const PIPELINE_BASE_URL = process.env.PIPELINE_BASE_URL ?? 'http://localhost:3001';

/**
 * Fan-out job: starts one chapter-extraction pipeline per chapter via HTTP.
 *
 * Uses Promise.allSettled to fire all requests concurrently.
 * Does NOT wait for chapter pipelines to complete (fire-and-forget).
 * Each POST starts a neuroline pipeline asynchronously and returns immediately.
 */
export const dispatchChaptersJob: JobDefinition = {
	name: 'dispatch-chapters',
	async execute(
		rawInput: unknown,
		_options: unknown,
		context: JobContext,
	): Promise<DispatchChaptersOutput> {
		const input = rawInput as DispatchChaptersInput;
		const url = `${PIPELINE_BASE_URL}/api/v1/chapter-extraction`;

		context.logger.info(
			`Dispatching ${input.chapters.length} chapter pipelines to ${url}`,
		);

		const results = await Promise.allSettled(
			input.chapters.map(async (chapter) => {
				const response = await fetch(url, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
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
