import type { JobDefinition, JobContext } from 'neuroline';
import type { LlmAdapter } from '../../llm/adapter';
import type { LanguageItemBase } from '../../llm/schemas';
import type { ChapterExtractionInput } from '../chapter-extraction.pipeline';

export interface ExtractRareWordsOutput {
	rareWords: LanguageItemBase[];
}

export function createExtractRareWordsJob(adapter: LlmAdapter): JobDefinition {
	return {
		name: 'extract-rare-words',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<ExtractRareWordsOutput> {
			const input = rawInput as ChapterExtractionInput;

			context.logger.info(
				`Extracting rare words for chapter ${input.chapterIndex}: "${input.chapterTitle}"`,
			);

			const rareWords = await adapter.extractRareWords(input.chapterText);

			context.logger.info(
				`Extracted ${rareWords.length} rare words for chapter ${input.chapterIndex}`,
			);

			return { rareWords };
		},
	};
}
