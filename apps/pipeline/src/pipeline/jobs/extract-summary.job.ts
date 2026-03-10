import type { JobDefinition, JobContext } from 'neuroline';
import type { LlmAdapter } from '../../llm/adapter';
import type { ChapterExtractionInput } from '../chapter-extraction.pipeline';

export interface ExtractSummaryOutput {
	summary: string;
}

export function createExtractSummaryJob(adapter: LlmAdapter): JobDefinition {
	return {
		name: 'extract-summary',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<ExtractSummaryOutput> {
			const input = rawInput as ChapterExtractionInput;

			context.logger.info(
				`Extracting summary for chapter ${input.chapterIndex}: "${input.chapterTitle}"`,
			);

			const summary = await adapter.extractSummary(input.chapterText);

			context.logger.info(
				`Summary extracted for chapter ${input.chapterIndex} (${summary.length} chars)`,
			);

			return { summary };
		},
	};
}
