import type { JobDefinition, JobContext } from 'neuroline';
import type { LlmAdapter } from '../../llm/adapter';
import type { LanguageItemBase } from '../../llm/schemas';
import type { ChapterExtractionInput } from '../chapter-extraction.pipeline';

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
