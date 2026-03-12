import type { JobDefinition } from 'neuroline';
import type { LlmAdapter } from '../types';
export interface ExtractSummaryOutput {
    summary: string;
}
export declare function createExtractSummaryJob(adapter: LlmAdapter): JobDefinition;
