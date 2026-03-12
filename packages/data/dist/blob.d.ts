export declare function uploadEpub(bookId: string, fileBuffer: Buffer): Promise<string>;
/**
 * Downloads an EPUB from private Vercel Blob storage using Bearer auth.
 * Requires `BLOB_READ_WRITE_TOKEN` in the environment.
 */
export declare function downloadEpub(url: string): Promise<Buffer>;
export declare function uploadCoverImage(bookId: string, imageBuffer: Buffer, contentType: string): Promise<string>;
export declare function deleteBlob(url: string): Promise<void>;
