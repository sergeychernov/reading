"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDispatchChaptersJob = createDispatchChaptersJob;
const DEFAULT_BASE_URL = 'http://localhost:3001';
/**
 * Fan-out job: starts one chapter-extraction pipeline per chapter via HTTP.
 *
 * Checks the `autoDispatchChapters` flag via readPipelineConfig before dispatching.
 * If disabled, exits early without making any HTTP calls.
 * Uses Promise.allSettled to fire all requests concurrently (fire-and-forget).
 */
function createDispatchChaptersJob(options) {
    const baseUrl = options.pipelineBaseUrl ?? process.env.PIPELINE_BASE_URL ?? DEFAULT_BASE_URL;
    const secret = options.pipelineApiSecret ?? process.env.PIPELINE_API_SECRET;
    return {
        name: 'dispatch-chapters',
        async execute(rawInput, _options, context) {
            const input = rawInput;
            const pipelineConfig = await options.readPipelineConfig();
            if (!pipelineConfig.autoDispatchChapters) {
                context.logger.info('autoDispatchChapters is disabled — skipping chapter dispatch');
                return { dispatched: 0, errors: 0, skipped: true };
            }
            const url = `${baseUrl}/api/v1/chapter-extraction`;
            context.logger.info(`Dispatching ${input.chapters.length} chapter pipelines to ${url}`);
            const headers = { 'Content-Type': 'application/json' };
            if (secret)
                headers['x-internal-secret'] = secret;
            const results = await Promise.allSettled(input.chapters.map(async (chapter) => {
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
                    throw new Error(`Failed to dispatch chapter ${chapter.index}: ${response.status} ${body}`);
                }
                return response.json();
            }));
            let dispatched = 0;
            let errors = 0;
            for (const result of results) {
                if (result.status === 'fulfilled') {
                    dispatched++;
                }
                else {
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
