import type { JobDefinition, SynapseContext } from 'neuroline';
import type { LlmAdapter } from '../types';
import type { ExtractRarityOutput } from './extract-rarity.job';
export interface ExtractMeaningRuInput {
    chapterIndex: number;
    chapterTitle: string;
    idioms: ExtractRarityOutput['idioms'];
    phrasalVerbs: ExtractRarityOutput['phrasalVerbs'];
    rareWords: ExtractRarityOutput['rareWords'];
}
export interface ExtractMeaningRuOutput {
    idioms: string[];
    phrasalVerbs: string[];
    rareWords: string[];
}
export declare function buildExtractMeaningRuSynapses(ctx: SynapseContext): ExtractMeaningRuInput;
export declare function createExtractMeaningRuJob(adapter: LlmAdapter): JobDefinition;
