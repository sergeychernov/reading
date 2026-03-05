import type { ChapterExtraction } from './schemas';

/**
 * Abstract interface for LLM-based language extraction.
 * Implement this interface for each LLM provider (OpenAI, Claude, Gemini, etc.).
 */
export interface LlmAdapter {
	/**
	 * Extracts idioms, phrasal verbs, rare words, and a summary
	 * from the given chapter text.
	 */
	extractFromChapter(chapterText: string): Promise<ChapterExtraction>;
}
