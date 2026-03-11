import type { JobDefinition } from 'neuroline';
import type { LanguageItemBase } from '@reading/llm-schemas';
import type { LlmAdapter } from '../types';
export interface ExtractIdiomsOutput {
    idioms: LanguageItemBase[];
}
export declare function createExtractIdiomsJob(adapter: LlmAdapter): JobDefinition;
