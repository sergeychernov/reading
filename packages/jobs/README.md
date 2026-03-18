# @reading/jobs

Shared neuroline job definitions for the reading pipeline. Used by **apps/pipeline** (full pipelines) and **apps/admin** (atomic single-job pipelines for testing or re-running a specific job).

## Usage

### Pipeline app

Import jobs and build pipeline configs:

```ts
import {
	fetchEpubJob,
	parseEpubJob,
	createDispatchChaptersJob,
	type FetchEpubOutput,
	type SaveChaptersOutput,
} from '@reading/jobs';
import { readPipelineConfig } from './pipeline-config';

// Multi-stage pipeline
const stages = [
	{ job: fetchEpubJob, retries: 3, retryDelay: 3000 },
	{ job: parseEpubJob, synapses: (ctx) => ctx.getArtifact<FetchEpubOutput>('fetch-epub') },
	// ...
	{ job: createDispatchChaptersJob({ readPipelineConfig }) },
];
```

### Admin app — atomic (single-job) pipelines

Use one job per pipeline for testing or re-running a specific step:

```ts
import type { PipelineConfig } from 'neuroline';
import { fetchEpubJob, type BookProcessingInput } from '@reading/jobs';

export function createFetchEpubPipeline(): PipelineConfig {
	return {
		name: 'fetch-epub-single',
		stages: [{ job: fetchEpubJob }],
	};
}

// Input for this pipeline matches BookProcessingInput: { bookId }
```

Jobs that need an **LlmAdapter** (e.g. `createExtractSummaryJob`) receive it when creating the job: pass your adapter (e.g. StubAdapter or GatewayAdapter) so the same job runs with the same LLM config. Jobs that need **pipeline config** (e.g. `createDispatchChaptersJob`) receive a reader: `createDispatchChaptersJob({ readPipelineConfig })`.

## Environment

Jobs that talk to MongoDB use `MONGODB_URI` and assume database name `reading`.  
`fetch-epub` uses `BLOB_READ_WRITE_TOKEN`.  
`createDispatchChaptersJob` uses `PIPELINE_BASE_URL` and `PIPELINE_API_SECRET` from env unless you pass `pipelineBaseUrl` / `pipelineApiSecret` in options.

## Exports

- **Types:** `BookProcessingInput`, `ChapterExtractionInput`, `LlmAdapter`, `PipelineConfig`
- **Book-processing jobs:** `fetchEpubJob`, `parseEpubJob`, `saveChaptersJob`, `createDispatchChaptersJob(options)`
- **Chapter-extraction jobs:** `createExtractSummaryJob(adapter)`, `createExtractIdiomsJob(adapter)`, and the rest; `saveChapterResultsJob`; `buildExtractRaritySynapses`, `buildExtractMeaningEnSynapses`, `buildExtractMeaningRuSynapses`, `buildSaveChapterResultsSynapses`
- **Single-pass extraction:** `createExtractLanguageItemsJob(adapter)`
