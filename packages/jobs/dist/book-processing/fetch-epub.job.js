"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchEpubJob = void 0;
const data_1 = require("@reading/data");
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
            context.logger.info(`Fetching EPUB from ${input.epubBlobUrl}`);
            const epubBuffer = await (0, data_1.downloadEpub)(input.epubBlobUrl);
            const epubBase64 = epubBuffer.toString('base64');
            context.logger.info(`Fetched EPUB for book ${input.bookId} (${epubBuffer.byteLength} bytes)`);
            return {
                bookId: input.bookId,
                epubBlobUrl: input.epubBlobUrl,
                epubBase64,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error during EPUB fetch';
            context.logger.error(`fetch-epub failed for book ${input.bookId}: ${message}`);
            await (0, data_1.withDb)((db) => (0, data_1.markBookFailed)(db, input.bookId, message));
            throw error;
        }
    },
};
