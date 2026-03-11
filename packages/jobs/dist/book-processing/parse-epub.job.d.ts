import type { JobDefinition } from 'neuroline';
import type { ParsedBookMetadata } from '@reading/epub-utils';
export interface ParseEpubChapter {
    index: number;
    title: string;
    text: string;
}
export interface ParseEpubOutput {
    bookId: string;
    metadata: ParsedBookMetadata;
    chapters: ParseEpubChapter[];
}
/**
 * Parses the EPUB file content received from the fetch-epub artifact.
 * On failure, marks the book as 'failed' in MongoDB before rethrowing.
 */
export declare const parseEpubJob: JobDefinition;
