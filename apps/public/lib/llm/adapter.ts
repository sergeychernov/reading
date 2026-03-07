import type { ChapterExtraction } from '@reading/llm-schemas';

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

/**
 * Returns the configured LLM adapter.
 * Currently returns the stub adapter.
 * Replace with a real adapter when an LLM provider is configured.
 */
export function getLlmAdapter(): LlmAdapter {
	// When an LLM provider is configured, import and return the
	// corresponding adapter here. For example:
	//
	// if (process.env.OPENAI_API_KEY) {
	//     const { OpenAiAdapter } = await import('./openai-adapter');
	//     return new OpenAiAdapter();
	// }

	const { StubAdapter } = require('./stub-adapter') as typeof import('./stub-adapter');
	return new StubAdapter();
}
