import type { LlmAdapter } from './adapter';
import type { ChapterExtraction } from './schemas';

/**
 * Stub adapter that returns empty results.
 * Useful for testing the processing pipeline without an actual LLM.
 */
export class StubAdapter implements LlmAdapter {
	async extractFromChapter(_chapterText: string): Promise<ChapterExtraction> {
		return {
			summary: '',
			idioms: [],
			phrasalVerbs: [],
			rareWords: [],
		};
	}
}
