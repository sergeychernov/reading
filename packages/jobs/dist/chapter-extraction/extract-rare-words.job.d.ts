import type { JobDefinition } from 'neuroline';
import type { LanguageItemBase } from '@reading/llm-schemas';
import type { LlmAdapter } from '../types';
export interface ExtractRareWordsOutput {
    rareWords: LanguageItemBase[];
}
export declare function createExtractRareWordsJob(adapter: LlmAdapter): JobDefinition;
