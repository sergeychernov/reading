import type { JobDefinition } from 'neuroline';
import type { PipelineConfig } from '../types';
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
/**
 * Fan-out job: starts one chapter-extraction pipeline per chapter via HTTP.
 *
 * Checks the `autoDispatchChapters` flag via readPipelineConfig before dispatching.
 * If disabled, exits early without making any HTTP calls.
 * Uses Promise.allSettled to fire all requests concurrently (fire-and-forget).
 */
export declare function createDispatchChaptersJob(options: DispatchChaptersOptions): JobDefinition;
