import type { JobContext, JobDefinition, SynapseContext } from 'neuroline';
import type { LanguageItemBase, LanguageItemScored, RareWordItem } from '@reading/llm-schemas';
import type { LlmAdapter } from '../types';
import type { ChapterExtractionInput } from '../types';
import type { ExtractIdiomsOutput } from './extract-idioms.job';
import type { ExtractPhrasalVerbsOutput } from './extract-phrasal-verbs.job';
import type { ExtractRareWordsOutput } from './extract-rare-words.job';

export interface ExtractRarityInput {
	chapterIndex: number;
	chapterTitle: string;
	idioms: LanguageItemBase[];
	phrasalVerbs: LanguageItemBase[];
	rareWords: RareWordItem[];
}

export interface ExtractRarityOutput {
	idioms: LanguageItemScored[];
	phrasalVerbs: LanguageItemScored[];
	rareWords: LanguageItemScored[];
}

export function buildExtractRaritySynapses(ctx: SynapseContext): ExtractRarityInput {
	const pipelineInput = ctx.pipelineInput as ChapterExtractionInput;

	const idiomsArtifact = ctx.getArtifact<ExtractIdiomsOutput>('extract-idioms');
	const phrasalVerbsArtifact = ctx.getArtifact<ExtractPhrasalVerbsOutput>('extract-phrasal-verbs');
	const rareWordsArtifact = ctx.getArtifact<ExtractRareWordsOutput>('extract-rare-words');

	if (!idiomsArtifact) throw new Error('extract-idioms artifact not found');
	if (!phrasalVerbsArtifact) throw new Error('extract-phrasal-verbs artifact not found');
	if (!rareWordsArtifact) throw new Error('extract-rare-words artifact not found');

	return {
		chapterIndex: pipelineInput.chapterIndex,
		chapterTitle: pipelineInput.chapterTitle,
		idioms: idiomsArtifact.idioms,
		phrasalVerbs: phrasalVerbsArtifact.phrasalVerbs,
		rareWords: rareWordsArtifact.rareWords,
	};
}

export function createExtractRarityJob(adapter: LlmAdapter): JobDefinition {
	return {
		name: 'extract-rarity',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<ExtractRarityOutput> {
			const input = rawInput as ExtractRarityInput;

			context.logger.info(
				`Extracting rarity for chapter ${input.chapterIndex}: "${input.chapterTitle}"`,
			);

			const allItems = [
				...input.idioms,
				...input.phrasalVerbs,
				...input.rareWords,
			];
			const enrichedItems = await adapter.extractRarity(allItems);

			const idiomsEnd = input.idioms.length;
			const phrasalVerbsEnd = idiomsEnd + input.phrasalVerbs.length;
			const idioms = enrichedItems.slice(0, idiomsEnd);
			const phrasalVerbs = enrichedItems.slice(idiomsEnd, phrasalVerbsEnd);
			const rareWords = enrichedItems.slice(phrasalVerbsEnd);

			context.logger.info(
				`Rarity extracted for chapter ${input.chapterIndex} ` +
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
