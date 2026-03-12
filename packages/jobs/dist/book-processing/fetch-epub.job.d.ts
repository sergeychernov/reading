import type { JobDefinition } from 'neuroline';
export interface FetchEpubOutput {
    bookId: string;
    epubBlobUrl: string;
    /** Base64-encoded EPUB file content */
    epubBase64: string;
}
/**
 * Downloads the EPUB file from private Vercel Blob storage.
 * Uses BLOB_READ_WRITE_TOKEN for Bearer auth. Returns the raw content as base64
 * for neuroline artifact. On failure, marks the book as 'failed' in MongoDB before rethrowing.
 */
export declare const fetchEpubJob: JobDefinition;
