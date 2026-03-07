import type { PipelineConfig, SynapseContext } from 'neuroline';
import { fetchEpubJob } from './jobs/fetch-epub.job';
import type { FetchEpubOutput } from './jobs/fetch-epub.job';
import { parseEpubJob } from './jobs/parse-epub.job';
import type { ParseEpubOutput } from './jobs/parse-epub.job';
import { saveChaptersJob } from './jobs/save-chapters.job';
import type { SaveChaptersOutput } from './jobs/save-chapters.job';
import { dispatchChaptersJob } from './jobs/dispatch-chapters.job';

export interface BookProcessingInput {
	bookId: string;
	epubBlobUrl: string;
}

/**
 * Book processing pipeline — 4 stages:
 * 1. fetch-epub — downloads EPUB file from Vercel Blob
 * 2. parse-epub — parses EPUB content into metadata and chapters
 * 3. save-chapters — saves book metadata and chapters to MongoDB
 * 4. dispatch-chapters — conditionally starts chapter-extraction pipelines
 *
 * Stage 4 checks the `autoDispatchChapters` flag in MongoDB at runtime.
 * When disabled, it exits immediately without making any HTTP calls.
 * The flag is controlled from the admin panel (Pipeline settings).
 */
export function createBookProcessingPipeline(): PipelineConfig {
	return {
		name: 'book-processing',
		stages: [
			// Stage 1: Download EPUB from Blob
			// Vercel Blob CDN may return 404 briefly after upload — retry with delay
			{ job: fetchEpubJob, retries: 3, retryDelay: 3000 },

			// Stage 2: Parse EPUB content
			{
				job: parseEpubJob,
				synapses: (ctx: SynapseContext) => {
					const fetchResult = ctx.getArtifact<FetchEpubOutput>('fetch-epub');

					if (!fetchResult) {
						throw new Error('fetch-epub artifact not found');
					}

					return fetchResult;
				},
			},

			// Stage 3: Save chapters to MongoDB
			{
				job: saveChaptersJob,
				synapses: (ctx: SynapseContext) => {
					const parseResult = ctx.getArtifact<ParseEpubOutput>('parse-epub');

					if (!parseResult) {
						throw new Error('parse-epub artifact not found');
					}

					return parseResult;
				},
			},

			// Stage 4: Conditionally dispatch chapter-extraction pipelines
			{
				job: dispatchChaptersJob,
				synapses: (ctx: SynapseContext) => {
					const saveResult = ctx.getArtifact<SaveChaptersOutput>('save-chapters');

					if (!saveResult) {
						throw new Error('save-chapters artifact not found');
					}

					return {
						bookId: saveResult.bookId,
						chapters: saveResult.chapters,
					};
				},
			},
		],
	};
}

// Default pipeline instance used by the NestJS module
export const bookProcessingPipeline = createBookProcessingPipeline();
