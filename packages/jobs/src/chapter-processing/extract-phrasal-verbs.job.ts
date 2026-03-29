import type { JobDefinition, JobContext } from 'neuroline';
import type { LanguageItemBase } from '@reading/llm-schemas';
import { downloadBlob } from '@reading/data';
import type { LlmAdapter } from '../types';

export interface ExtractPhrasalVerbsFromBlobInput {
	chapterId: string;
	textJsonBlobKey: string;
}

export interface ExtractPhrasalVerbsFromBlobOutput {
	phrasalVerbs: LanguageItemBase[];
}

export function createExtractPhrasalVerbsFromBlobJob(adapter: LlmAdapter): JobDefinition {
	return {
		name: 'extract-phrasal-verbs',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<ExtractPhrasalVerbsFromBlobOutput> {
			const input = rawInput as ExtractPhrasalVerbsFromBlobInput;

			context.logger.info(
				`extract-phrasal-verbs: downloading chapter text from ${input.textJsonBlobKey}`,
			);

			const buf = await downloadBlob(input.textJsonBlobKey);
			const paragraphs = JSON.parse(buf.toString('utf8')) as string[];
			const chapterText = paragraphs.join('\n\n');

			context.logger.info(
				`extract-phrasal-verbs: extracting phrasal verbs (${chapterText.length} chars)`,
			);

			const phrasalVerbs = await adapter.extractPhrasalVerbs(chapterText);

			context.logger.info(
				`extract-phrasal-verbs: extracted ${phrasalVerbs.length} phrasal verbs`,
			);

			return { phrasalVerbs };
		},
	};
}
