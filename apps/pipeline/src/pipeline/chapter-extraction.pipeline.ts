import type { PipelineConfig, SynapseContext } from 'neuroline';
import {
	createExtractSummaryJob,
	createExtractIdiomsJob,
	createExtractPhrasalVerbsJob,
	createExtractRareWordsJob,
	createExtractRarityJob,
	buildExtractRaritySynapses,
	createExtractMeaningEnJob,
	buildExtractMeaningEnSynapses,
	createExtractMeaningRuJob,
	buildExtractMeaningRuSynapses,
	saveChapterResultsJob,
	buildSaveChapterResultsSynapses,
	type ChapterExtractionInput,
} from '@reading/jobs';
import { DynamicAdapter } from '../llm/dynamic-adapter';

export type { ChapterExtractionInput };

const adapter = new DynamicAdapter();

/**
 * Pipeline for processing a single chapter.
 *
 * Stage 1: chapter summary extraction.
 * Stages 2–4: extraction jobs run separately by category.
 * Stage 5: enrich extracted language items with rarity scores.
 * Stage 6-7: enrich meanings with separate EN/RU translation jobs.
 * Stage 8: save all results to MongoDB.
 *
 * Uses DynamicAdapter which reads the active LLM config from MongoDB on every call,
 * so admin panel changes take effect without restarting the server.
 *
 * computeInputHash returns a unique value each time so neuroline always creates
 * a new run instead of returning the cached result of a previous identical input.
 */
export const chapterExtractionPipeline: PipelineConfig = {
	name: 'chapter-extraction',
	stages: [
		{
			job: createExtractSummaryJob(adapter),
			retries: 3,
			retryDelay: 5000,
		},
		{
			job: createExtractIdiomsJob(adapter),
			retries: 3,
			retryDelay: 5000,
			synapses: (ctx: SynapseContext) => ctx.pipelineInput as ChapterExtractionInput,
		},
		{
			job: createExtractPhrasalVerbsJob(adapter),
			retries: 3,
			retryDelay: 5000,
			synapses: (ctx: SynapseContext) => ctx.pipelineInput as ChapterExtractionInput,
		},
		{
			job: createExtractRareWordsJob(adapter),
			retries: 3,
			retryDelay: 5000,
			synapses: (ctx: SynapseContext) => ctx.pipelineInput as ChapterExtractionInput,
		},
		{
			job: createExtractRarityJob(adapter),
			retries: 3,
			retryDelay: 5000,
			synapses: buildExtractRaritySynapses,
		},
		{
			job: createExtractMeaningEnJob(adapter),
			retries: 3,
			retryDelay: 5000,
			synapses: buildExtractMeaningEnSynapses,
		},
		{
			job: createExtractMeaningRuJob(adapter),
			retries: 3,
			retryDelay: 5000,
			synapses: buildExtractMeaningRuSynapses,
		},
		{
			job: saveChapterResultsJob,
			synapses: buildSaveChapterResultsSynapses,
		},
	],
	computeInputHash: () => crypto.randomUUID(),
};
