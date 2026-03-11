import type { JobDefinition, SynapseContext } from 'neuroline';
import type { LlmAdapter } from '../types';
import type { ExtractRarityOutput } from './extract-rarity.job';
export interface ExtractMeaningEnInput {
    chapterIndex: number;
    chapterTitle: string;
    idioms: ExtractRarityOutput['idioms'];
    phrasalVerbs: ExtractRarityOutput['phrasalVerbs'];
    rareWords: ExtractRarityOutput['rareWords'];
}
export interface ExtractMeaningEnOutput {
    idioms: string[];
    phrasalVerbs: string[];
    rareWords: string[];
}
export declare function buildExtractMeaningEnSynapses(ctx: SynapseContext): ExtractMeaningEnInput;
export declare function createExtractMeaningEnJob(adapter: LlmAdapter): JobDefinition;
