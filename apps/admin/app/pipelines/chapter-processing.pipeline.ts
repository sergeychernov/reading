import type { PipelineConfig, SynapseContext } from 'neuroline';
import {
	startChapterProcessingJob,
	extractChapterJob,
	completeChapterProcessingJob,
	createExtractIdiomsFromBlobJob,
	createExtractPhrasalVerbsFromBlobJob,
	createExtractRareWordsFromBlobJob,
	createExtractMeaningEnJob,
	createExtractMeaningRuJob,
	saveLanguageItemsJob,
	buildSaveLanguageItemsSynapses,
	type ChapterProcessingInput,
	type CompleteChapterProcessingInput,
	type ExtractChapterOutput,
	type ExtractIdiomsFromBlobOutput,
	type ExtractPhrasalVerbsFromBlobOutput,
	type ExtractRareWordsFromBlobOutput,
	type ExtractMeaningEnInput,
} from '@reading/jobs';
import { DynamicAdapter } from './dynamic-adapter';

const adapter = new DynamicAdapter();

function extractionFromBlobSynapses(
	ctx: SynapseContext<ChapterProcessingInput>,
) {
	const extractChapter = ctx.getArtifact<ExtractChapterOutput>('extract-chapter');
	if (!extractChapter) {
		throw new Error('extract-chapter artifact not found');
	}
	return {
		chapterId: ctx.pipelineInput.chapterId,
		textJsonBlobKey: extractChapter.textJsonBlobKey,
	};
}

function meaningExtractionSynapses(
	ctx: SynapseContext<ChapterProcessingInput>,
): ExtractMeaningEnInput {
	const extractChapter = ctx.getArtifact<ExtractChapterOutput>('extract-chapter');
	const idiomsArtifact = ctx.getArtifact<ExtractIdiomsFromBlobOutput>('extract-idioms');
	const phrasalVerbsArtifact = ctx.getArtifact<ExtractPhrasalVerbsFromBlobOutput>('extract-phrasal-verbs');
	const rareWordsArtifact = ctx.getArtifact<ExtractRareWordsFromBlobOutput>('extract-rare-words');

	if (!extractChapter?.title) throw new Error('meaning-extraction: extract-chapter artifact not found');
	if (!idiomsArtifact?.idioms) throw new Error('meaning-extraction: extract-idioms artifact not found');
	if (!phrasalVerbsArtifact?.phrasalVerbs) throw new Error('meaning-extraction: extract-phrasal-verbs artifact not found');
	if (!rareWordsArtifact?.rareWords) throw new Error('meaning-extraction: extract-rare-words artifact not found');

	const withDefaultRarity = <T extends { term: string; exampleFromBook: string }>(items: T[]) =>
		items.map((item) => ({ ...item, rarity: 5 }));

	return {
		chapterIndex: extractChapter.chapterIndex,
		chapterTitle: extractChapter.title,
		idioms: withDefaultRarity(idiomsArtifact.idioms),
		phrasalVerbs: withDefaultRarity(phrasalVerbsArtifact.phrasalVerbs),
		rareWords: withDefaultRarity(rareWordsArtifact.rareWords),
	};
}

function completeChapterProcessingSynapses(
	ctx: SynapseContext<ChapterProcessingInput>,
): CompleteChapterProcessingInput {
	const chapterId = typeof ctx.pipelineInput.chapterId === 'string'
		? ctx.pipelineInput.chapterId.trim()
		: '';
	if (!chapterId) {
		throw new Error('complete-chapter-processing: chapterId is required');
	}

	return { chapterId };
}

/**
 * Admin chapter-processing pipeline:
 * 1) mark chapter as `extracting` and store `pipelineId`
 * 2) load and classify XHTML; persist `chapterKind` + `title` on the chapter document
 * 3) (manual) extract idioms, phrasal verbs, rare words from chapter JSON in parallel
 * 4) (manual) extract EN and RU meanings for extracted items in parallel
 * 5) (manual) save extracted language items to MongoDB
 * 6) mark chapter as `completed`
 *
 * Input: `{ chapterId }` (book and index come from MongoDB in jobs).
 */
export const chapterProcessingPipeline: PipelineConfig<ChapterProcessingInput> = {
	name: 'admin-chapter-processing',
	stages: [
		{
			job: startChapterProcessingJob,
			synapses: (ctx) => ctx.pipelineInput,
		},
		{
			job: extractChapterJob,
			synapses: (ctx) => ctx.pipelineInput,
		},
		[
			{
				job: createExtractIdiomsFromBlobJob(adapter),
				synapses: extractionFromBlobSynapses,
			},
			{
				job: createExtractPhrasalVerbsFromBlobJob(adapter),
				synapses: extractionFromBlobSynapses,
			},
			{
				job: createExtractRareWordsFromBlobJob(adapter),
				synapses: extractionFromBlobSynapses,
			},
		],
		[
			{
				job: createExtractMeaningEnJob(adapter),
				synapses: meaningExtractionSynapses,
			},
			{
				job: createExtractMeaningRuJob(adapter),
				synapses: meaningExtractionSynapses,
			},
		],
		{
			job: saveLanguageItemsJob,
			synapses: buildSaveLanguageItemsSynapses,
		},
		{
			job: completeChapterProcessingJob,
			synapses: completeChapterProcessingSynapses,
		},
	],
};
