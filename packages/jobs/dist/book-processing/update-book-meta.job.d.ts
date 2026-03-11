import type { JobDefinition } from 'neuroline';
/**
 * Updates only book metadata in MongoDB from parsed EPUB (title, author, description).
 * Also sets processingStatus to 'done' and clears processingError on success.
 * Does not touch chapters. Used by book-reprocessing pipeline in admin.
 */
export declare const updateBookMetaJob: JobDefinition;
