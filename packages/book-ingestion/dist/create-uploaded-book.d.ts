import type { CreateUploadedBookParams, CreateUploadedBookResult } from './types';
/**
 * Creates a book entry in MongoDB and uploads the EPUB to Blob storage.
 * Leaves the book in `uploaded` status after setting `epubBlobUrl`.
 */
export declare function createUploadedBook(params: CreateUploadedBookParams): Promise<CreateUploadedBookResult>;
