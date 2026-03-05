import type { PipelineConfig } from 'neuroline';
import { createProcessChapterJob } from './jobs/process-chapter.job';
import type { LlmAdapter } from '../llm/adapter';
import { StubAdapter } from '../llm/stub-adapter';

export interface ChapterExtractionInput {
	bookId: string;
	chapterId: string;
	chapterIndex: number;
	chapterTitle: string;
	chapterText: string;
}

/**
 * Pipeline for processing a single chapter.
 * Receives chapter data as input, runs LLM extraction, saves results to MongoDB.
 *
 * One instance of this pipeline is started per chapter by the dispatch-chapters job.
 */
export function createChapterExtractionPipeline(
	adapter?: LlmAdapter,
): PipelineConfig {
	const llmAdapter = adapter ?? new StubAdapter();

	return {
		name: 'chapter-extraction',
		stages: [
			{ job: createProcessChapterJob(llmAdapter) },
		],
	};
}

// Default pipeline instance used by the NestJS module
export const chapterExtractionPipeline = createChapterExtractionPipeline();
