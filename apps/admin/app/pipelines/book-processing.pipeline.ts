import type { JobDefinition, PipelineConfig } from 'neuroline';
import { extractBookJob, parseMetadataJob, buildParseMetadataSynapses } from '@reading/jobs';
import crypto from 'crypto';

/**
 * Admin book-processing pipeline — two stages:
 * 1. extract-book — downloads EPUB, parses it, uploads chapters/cover/metadata.json to Blob
 * 2. parse-metadata — downloads metadata.json, parses it, updates book title/author/description in DB
 *
 * Each run is unique (uses random inputHash) so the same book can be re-processed.
 */
export const bookProcessingPipeline: PipelineConfig = {
	name: 'admin-book-processing',
	stages: [
		{ job: extractBookJob as JobDefinition, retries: 0, retryDelay: 3000 },
		{
			job: parseMetadataJob as JobDefinition,
			synapses: buildParseMetadataSynapses,
			retries: 0,
			retryDelay: 3000,
		},
	],
	computeInputHash: () => crypto.randomUUID(),
};
