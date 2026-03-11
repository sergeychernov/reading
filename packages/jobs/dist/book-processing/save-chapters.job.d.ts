import type { JobDefinition } from 'neuroline';
export interface SavedChapter {
    chapterId: string;
    index: number;
    title: string;
    text: string;
}
export interface SaveChaptersOutput {
    bookId: string;
    chapters: SavedChapter[];
}
/**
 * Saves parsed EPUB data to MongoDB:
 * - Updates book document with title, author, description
 * - Inserts chapter documents with rawText
 * - Sets book processingStatus to 'extracting'
 */
export declare const saveChaptersJob: JobDefinition;
