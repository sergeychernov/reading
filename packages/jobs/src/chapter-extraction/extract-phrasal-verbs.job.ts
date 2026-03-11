import type { JobDefinition, JobContext } from 'neuroline';
import type { LanguageItemBase } from '@reading/llm-schemas';
import type { LlmAdapter } from '../types';
import type { ChapterExtractionInput } from '../types';

export interface ExtractPhrasalVerbsOutput {
	phrasalVerbs: LanguageItemBase[];
}

export function createExtractPhrasalVerbsJob(adapter: LlmAdapter): JobDefinition {
	return {
		name: 'extract-phrasal-verbs',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<ExtractPhrasalVerbsOutput> {
			const input = rawInput as ChapterExtractionInput;

			context.logger.info(
				`Extracting phrasal verbs for chapter ${input.chapterIndex}: "${input.chapterTitle}"`,
			);

			const phrasalVerbs = await adapter.extractPhrasalVerbs(input.chapterText);

			context.logger.info(
				`Extracted ${phrasalVerbs.length} phrasal verbs for chapter ${input.chapterIndex}`,
			);

			return { phrasalVerbs };
		},
	};
}
