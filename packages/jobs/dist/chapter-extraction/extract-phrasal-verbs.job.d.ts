import type { JobDefinition } from 'neuroline';
import type { LanguageItemBase } from '@reading/llm-schemas';
import type { LlmAdapter } from '../types';
export interface ExtractPhrasalVerbsOutput {
    phrasalVerbs: LanguageItemBase[];
}
export declare function createExtractPhrasalVerbsJob(adapter: LlmAdapter): JobDefinition;
