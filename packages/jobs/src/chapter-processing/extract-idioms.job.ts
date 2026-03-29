import type { JobDefinition, JobContext } from 'neuroline';
import type { LanguageItemBase } from '@reading/llm-schemas';
import { downloadBlob } from '@reading/data';
import type { LlmAdapter } from '../types';

export interface ExtractIdiomsFromBlobInput {
	chapterId: string;
	textJsonBlobKey: string;
}

export interface ExtractIdiomsFromBlobOutput {
	idioms: LanguageItemBase[];
}

export function createExtractIdiomsFromBlobJob(adapter: LlmAdapter): JobDefinition {
	return {
		name: 'extract-idioms',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<ExtractIdiomsFromBlobOutput> {
			const input = rawInput as ExtractIdiomsFromBlobInput;

			context.logger.info(
				`extract-idioms: downloading chapter text from ${input.textJsonBlobKey}`,
			);

			const buf = await downloadBlob(input.textJsonBlobKey);
			const paragraphs = JSON.parse(buf.toString('utf8')) as string[];
			const chapterText = paragraphs.join('\n\n');

			context.logger.info(
				`extract-idioms: extracting idioms (${chapterText.length} chars)`,
			);

			const idioms = await adapter.extractIdioms(chapterText);

			context.logger.info(
				`extract-idioms: extracted ${idioms.length} idioms`,
			);

			return { idioms };
		},
	};
}
