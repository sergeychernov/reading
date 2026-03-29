import type { PipelineConfig, SynapseContext } from 'neuroline';
import {
	startChapterProcessingJob,
	extractChapterJob,
	completeChapterProcessingJob,
	type ChapterProcessingInput,
	type CompleteChapterProcessingInput,
} from '@reading/jobs';

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
 * 3) mark chapter as `completed`
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
			manual: true,
		},
		{
			job: completeChapterProcessingJob,
			synapses: completeChapterProcessingSynapses,
		},
	],
};
