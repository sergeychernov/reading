import type { JobDefinition } from 'neuroline';
import type { LanguageItemBase } from '@reading/llm-schemas';
import type { LlmAdapter } from '../types';
export interface ExtractLanguageItemsOutput {
    idioms: LanguageItemBase[];
    phrasalVerbs: LanguageItemBase[];
    rareWords: LanguageItemBase[];
}
export declare function createExtractLanguageItemsJob(adapter: LlmAdapter): JobDefinition;
