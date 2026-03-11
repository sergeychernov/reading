import type { JobContext, JobDefinition, SynapseContext } from 'neuroline';
import type { LlmAdapter } from '../types';
import type { ChapterExtractionInput } from '../types';
import type { ExtractRarityOutput } from './extract-rarity.job';

export interface ExtractMeaningRuInput {
	chapterIndex: number;
	chapterTitle: string;
	idioms: ExtractRarityOutput['idioms'];
	phrasalVerbs: ExtractRarityOutput['phrasalVerbs'];
	rareWords: ExtractRarityOutput['rareWords'];
}

export interface ExtractMeaningRuOutput {
	idioms: string[];
	phrasalVerbs: string[];
	rareWords: string[];
}

export function buildExtractMeaningRuSynapses(ctx: SynapseContext): ExtractMeaningRuInput {
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

export function createExtractMeaningRuJob(adapter: LlmAdapter): JobDefinition {
	return {
		name: 'extract-meaning-ru',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<ExtractMeaningRuOutput> {
			const input = rawInput as ExtractMeaningRuInput;

			context.logger.info(
				`Extracting RU meanings for chapter ${input.chapterIndex}: "${input.chapterTitle}"`,
			);

			const idioms = await adapter.translateMeanings(input.idioms, 'ru');
			const phrasalVerbs = await adapter.translateMeanings(input.phrasalVerbs, 'ru');
			const rareWords = await adapter.translateMeanings(input.rareWords, 'ru');

			context.logger.info(
				`Extracted RU meanings for chapter ${input.chapterIndex} ` +
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
