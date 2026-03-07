import type { PipelineConfig } from 'neuroline';
import { createProcessChapterJob } from './jobs/process-chapter.job';
import { DynamicAdapter } from '../llm/dynamic-adapter';

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
 * Uses DynamicAdapter which reads the active LLM config from MongoDB on every call,
 * so admin panel changes take effect without restarting the server.
 *
 * computeInputHash returns a unique value each time so neuroline always creates
 * a new run instead of returning the cached result of a previous identical input.
 */
export const chapterExtractionPipeline: PipelineConfig = {
	name: 'chapter-extraction',
	stages: [
		{ job: createProcessChapterJob(new DynamicAdapter()) },
	],
	computeInputHash: () => crypto.randomUUID(),
};
