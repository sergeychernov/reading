import type { JobContext, JobDefinition, SynapseContext } from 'neuroline';
import type { LlmAdapter } from '../types';
import type { ChapterExtractionInput } from '../types';
import type { ExtractRarityOutput } from './extract-rarity.job';

export interface ExtractMeaningEnInput {
	chapterIndex: number;
	chapterTitle: string;
	idioms: ExtractRarityOutput['idioms'];
	phrasalVerbs: ExtractRarityOutput['phrasalVerbs'];
	rareWords: ExtractRarityOutput['rareWords'];
}

export interface ExtractMeaningEnOutput {
	idioms: string[];
	phrasalVerbs: string[];
	rareWords: string[];
}

export function buildExtractMeaningEnSynapses(ctx: SynapseContext): ExtractMeaningEnInput {
	const pipelineInput = ctx.pipelineInput as ChapterExtractionInput;
	const rarityArtifact = ctx.getArtifact<ExtractRarityOutput>('extract-rarity');

	if (!rarityArtifact) {
		throw new Error('extract-rarity artifact not found');
	}

	return {
		chapterIndex: pipelineInput.chapterIndex,
		chapterTitle: pipelineInput.chapterTitle,
		idioms: rarityArtifact.idioms,
		phrasalVerbs: rarityArtifact.phrasalVerbs,
		rareWords: rarityArtifact.rareWords,
	};
}

export function createExtractMeaningEnJob(adapter: LlmAdapter): JobDefinition {
	return {
		name: 'extract-meaning-en',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<ExtractMeaningEnOutput> {
			const input = rawInput as ExtractMeaningEnInput;

			context.logger.info(
				`Extracting EN meanings for chapter ${input.chapterIndex}: "${input.chapterTitle}"`,
			);

			const idioms = await adapter.translateMeanings(input.idioms, 'en', 'idiom');
			const phrasalVerbs = await adapter.translateMeanings(input.phrasalVerbs, 'en', 'phrasal-verb');
			const rareWords = await adapter.translateMeanings(input.rareWords, 'en', 'rare-word');

			context.logger.info(
				`Extracted EN meanings for chapter ${input.chapterIndex} ` +
				`(${idioms.length} idioms, ${phrasalVerbs.length} phrasal verbs, ${rareWords.length} rare words)`,
			);

			return {
				idioms,
				phrasalVerbs,
				rareWords,
			};
		},
	};
}
