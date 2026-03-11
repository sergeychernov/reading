import type { JobDefinition, JobContext } from 'neuroline';
import type { LanguageItemBase } from '@reading/llm-schemas';
import type { LlmAdapter } from '../types';
import type { ChapterExtractionInput } from '../types';

export interface ExtractIdiomsOutput {
	idioms: LanguageItemBase[];
}

export function createExtractIdiomsJob(adapter: LlmAdapter): JobDefinition {
	return {
		name: 'extract-idioms',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<ExtractIdiomsOutput> {
			const input = rawInput as ChapterExtractionInput;

			context.logger.info(
				`Extracting idioms for chapter ${input.chapterIndex}: "${input.chapterTitle}"`,
			);

			const idioms = await adapter.extractIdioms(input.chapterText);

			context.logger.info(
				`Extracted ${idioms.length} idioms for chapter ${input.chapterIndex}`,
			);

			return { idioms };
		},
	};
}
