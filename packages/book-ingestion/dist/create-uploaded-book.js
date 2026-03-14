"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUploadedBook = createUploadedBook;
const data_1 = require("@reading/data");
/**
 * Creates a book entry in MongoDB and uploads the EPUB to Blob storage.
 * Leaves the book in `uploaded` status after setting `epubBlobUrl`.
 */
async function createUploadedBook(params) {
    const startedAt = Date.now();
    const fileSizeBytes = params.fileBuffer.byteLength;
    console.info(`[book-ingestion] createUploadedBook started: file="${params.fileName}", bytes=${fileSizeBytes}`);
    const contentHash = (0, data_1.computeContentHash)(params.fileBuffer);
    const now = new Date();
    const bookData = {
        contentHash,
        title: params.fileName,
        author: '',
        description: '',
        coverImageUrl: null,
        epubBlobUrl: '',
        audibleUrl: params.audibleUrl,
        kindleUrl: params.kindleUrl,
        chapterCount: 0,
        processingStatus: 'uploading',
        processingError: null,
        createdAt: now,
        updatedAt: now,
    };
    const db = await (0, data_1.getDb)();
    const bookId = await (0, data_1.insertBook)(db, bookData);
    console.info(`[book-ingestion] book inserted: bookId=${bookId}, elapsedMs=${Date.now() - startedAt}`);
    try {
        const uploadTimeoutMs = Number.parseInt(process.env.EPUB_UPLOAD_TIMEOUT_MS ?? '1200000', 10);
        const timeoutMs = Number.isFinite(uploadTimeoutMs) && uploadTimeoutMs > 0
            ? uploadTimeoutMs
            : 1200000;
        console.info(`[book-ingestion] upload started: bookId=${bookId}, timeoutMs=${timeoutMs}, tokenSet=${Boolean(process.env.BLOB_READ_WRITE_TOKEN)}`);
        const epubBlobUrl = await withTimeout((0, data_1.uploadEpub)(bookId, params.fileBuffer), timeoutMs, `EPUB upload timed out after ${timeoutMs}ms`);
        console.info(`[book-ingestion] upload completed: bookId=${bookId}, elapsedMs=${Date.now() - startedAt}`);
        await (0, data_1.updateBookEpubUrl)(db, bookId, epubBlobUrl);
        console.info(`[book-ingestion] book updated to uploaded: bookId=${bookId}, elapsedMs=${Date.now() - startedAt}`);
        return { bookId, epubBlobUrl };
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : 'Unknown error during EPUB upload';
        console.error(`[book-ingestion] upload failed: bookId=${bookId}, elapsedMs=${Date.now() - startedAt}, message="${message}"`);
        // Prevent records from staying in "uploading" forever on upload failures.
        try {
            await (0, data_1.markBookFailed)(db, bookId, message);
            console.info(`[book-ingestion] book marked failed: bookId=${bookId}, elapsedMs=${Date.now() - startedAt}`);
        }
        catch {
            // Ignore secondary DB update errors and preserve the original failure.
        }
        throw error;
    }
}
async function withTimeout(promise, timeoutMs, timeoutMessage) {
    let timeoutId = null;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(timeoutMessage));
        }, timeoutMs);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    }
    finally {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
}
