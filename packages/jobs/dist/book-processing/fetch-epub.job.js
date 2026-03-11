"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchEpubJob = void 0;
const mongodb_1 = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'reading';
async function markBookFailed(bookId, message) {
    const client = new mongodb_1.MongoClient(MONGODB_URI);
    try {
        await client.connect();
        await client.db(DB_NAME).collection('books').updateOne({ _id: new mongodb_1.ObjectId(bookId) }, { $set: { processingStatus: 'failed', processingError: message, updatedAt: new Date() } });
    }
    finally {
        await client.close();
    }
}
/**
 * Downloads the EPUB file from private Vercel Blob storage.
 * Uses BLOB_READ_WRITE_TOKEN for Bearer auth. Returns the raw content as base64
 * for neuroline artifact. On failure, marks the book as 'failed' in MongoDB before rethrowing.
 */
exports.fetchEpubJob = {
    name: 'fetch-epub',
    async execute(rawInput, _options, context) {
        const input = rawInput;
        context.logger.info(`Fetching EPUB for book ${input.bookId} from ${input.epubBlobUrl}`);
        try {
            const token = process.env.BLOB_READ_WRITE_TOKEN;
            if (!token) {
                throw new Error('BLOB_READ_WRITE_TOKEN is not set');
            }
            context.logger.info(`Fetching EPUB from ${input.epubBlobUrl}`);
            const response = await fetch(input.epubBlobUrl, {
                headers: { Authorization: `Bearer ${token}` },
            });
            context.logger.info(`fetch-epub response: ${response.status} ${response.statusText}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch EPUB: ${response.status} ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const epubBase64 = Buffer.from(arrayBuffer).toString('base64');
            context.logger.info(`Fetched EPUB for book ${input.bookId} (${arrayBuffer.byteLength} bytes)`);
            return {
                bookId: input.bookId,
                epubBlobUrl: input.epubBlobUrl,
                epubBase64,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error during EPUB fetch';
            context.logger.error(`fetch-epub failed for book ${input.bookId}: ${message}`);
            await markBookFailed(input.bookId, message);
            throw error;
        }
    },
};
