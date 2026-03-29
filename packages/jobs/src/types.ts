import type { LanguageItemBase, LanguageItemScored, RareWordItem } from '@reading/llm-schemas';

/**
 * Input for the book-processing pipeline (and fetch-epub job).
 */
export interface BookProcessingInput {
	bookId: string;
}

/**
 * Input for the chapter-processing pipeline (per-chapter XHTML in Blob).
 * `bookId` and `chapterIndex` are read from MongoDB by jobs using `chapterId`.
 */
export interface ChapterProcessingInput {
	chapterId: string;
}

/**
 * Input for the chapter-extraction pipeline and jobs that take chapter context.
 */
export interface ChapterExtractionInput {
	bookId: string;
	chapterId: string;
	chapterIndex: number;
	chapterTitle: string;
	chapterText: string;
}

/**
 * LLM adapter interface used by extraction jobs.
 * Implemented by pipeline (DynamicAdapter, GatewayAdapter, StubAdapter) or by admin for testing.
 */
export interface LlmAdapter {
	extractSummary(chapterText: string): Promise<string>;
	extractIdioms(chapterText: string): Promise<LanguageItemBase[]>;
	extractPhrasalVerbs(chapterText: string): Promise<LanguageItemBase[]>;
	extractRareWords(chapterText: string): Promise<RareWordItem[]>;
	extractRarity(items: LanguageItemBase[]): Promise<LanguageItemScored[]>;
	translateMeanings(
		items: LanguageItemScored[],
		language: 'en' | 'ru',
	): Promise<string[]>;
}

/**
 * Config reader for dispatch-chapters job (e.g. from MongoDB).
 */
export interface PipelineConfig {
	autoDispatchChapters: boolean;
}
