import type { JobDefinition, JobContext } from 'neuroline';
import type { RareWordItem } from '@reading/llm-schemas';
import { downloadBlob } from '@reading/data';
import type { LlmAdapter } from '../types';

export interface ExtractRareWordsFromBlobInput {
	chapterId: string;
	textJsonBlobKey: string;
}

export interface ExtractRareWordsFromBlobOutput {
	rareWords: RareWordItem[];
}

export function createExtractRareWordsFromBlobJob(adapter: LlmAdapter): JobDefinition {
	return {
		name: 'extract-rare-words',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<ExtractRareWordsFromBlobOutput> {
			const input = rawInput as ExtractRareWordsFromBlobInput;

			context.logger.info(
				`extract-rare-words: downloading chapter text from ${input.textJsonBlobKey}`,
			);

			const buf = await downloadBlob(input.textJsonBlobKey);
			const paragraphs = JSON.parse(buf.toString('utf8')) as string[];
			const chapterText = paragraphs.join('\n\n');

			context.logger.info(
				`extract-rare-words: extracting rare words (${chapterText.length} chars)`,
			);

			const rareWords = await adapter.extractRareWords(chapterText);

			context.logger.info(
				`extract-rare-words: extracted ${rareWords.length} rare words`,
			);

			return { rareWords };
		},
	};
}
