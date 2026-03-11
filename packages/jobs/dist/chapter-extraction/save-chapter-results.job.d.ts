import type { JobDefinition, SynapseContext } from 'neuroline';
import type { LanguageItemExtracted } from '@reading/llm-schemas';
export interface SaveChapterResultsInput {
    bookId: string;
    chapterId: string;
    chapterIndex: number;
    chapterTitle: string;
    summary: string;
    idioms: LanguageItemExtracted[];
    phrasalVerbs: LanguageItemExtracted[];
    rareWords: LanguageItemExtracted[];
}
export interface SaveChapterResultsOutput {
    chapterIndex: number;
    itemsSaved: number;
}
/**
 * Builds the synapses input for save-chapter-results by collecting
 * artifacts from summary, rarity, and per-language meaning extraction jobs.
 */
export declare function buildSaveChapterResultsSynapses(ctx: SynapseContext): SaveChapterResultsInput;
/**
 * Saves all extracted language items and chapter summary to MongoDB.
 * Marks chapter as 'completed' on success, 'failed' on error.
 * Idempotent: clears previous language items before inserting.
 */
export declare const saveChapterResultsJob: JobDefinition;
