import type { JobDefinition, SynapseContext } from 'neuroline';
import type { LanguageItemBase, LanguageItemScored } from '@reading/llm-schemas';
import type { LlmAdapter } from '../types';
export interface ExtractRarityInput {
    chapterIndex: number;
    chapterTitle: string;
    idioms: LanguageItemBase[];
    phrasalVerbs: LanguageItemBase[];
    rareWords: LanguageItemBase[];
}
export interface ExtractRarityOutput {
    idioms: LanguageItemScored[];
    phrasalVerbs: LanguageItemScored[];
    rareWords: LanguageItemScored[];
}
export declare function buildExtractRaritySynapses(ctx: SynapseContext): ExtractRarityInput;
export declare function createExtractRarityJob(adapter: LlmAdapter): JobDefinition;
