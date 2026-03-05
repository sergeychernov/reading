import type { PipelineConfig, SynapseContext } from 'neuroline';
import { parseEpubJob } from './jobs/parse-epub.job';
import type { ParseEpubOutput } from './jobs/parse-epub.job';
import { dispatchChaptersJob } from './jobs/dispatch-chapters.job';

export interface BookProcessingInput {
	bookId: string;
	epubBlobUrl: string;
}

/**
 * Book processing pipeline — 2 stages:
 * 1. parse-epub — loads chapters from MongoDB (text stored during upload)
 * 2. dispatch-chapters — starts one chapter-extraction pipeline per chapter via HTTP
 *
 * Each chapter is processed independently by a separate chapter-extraction pipeline,
 * enabling true dynamic parallelism without neuroline's static job limitation.
 */
export function createBookProcessingPipeline(): PipelineConfig {
	return {
		name: 'book-processing',
		stages: [
			// Stage 1: Parse EPUB (sequential, single job)
			{ job: parseEpubJob },

			// Stage 2: Dispatch chapter pipelines (fire-and-forget)
			{
				job: dispatchChaptersJob,
				synapses: (ctx: SynapseContext) => {
					const pipelineInput = ctx.pipelineInput as BookProcessingInput;
					const parseResult = ctx.getArtifact<ParseEpubOutput>('parse-epub');

					if (!parseResult) {
						throw new Error('parse-epub artifact not found');
					}

					return {
						bookId: pipelineInput.bookId,
						chapters: parseResult.chapters,
					};
				},
			},
		],
	};
}

// Default pipeline instance used by the NestJS module
export const bookProcessingPipeline = createBookProcessingPipeline();
