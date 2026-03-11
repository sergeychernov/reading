"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEpubJob = void 0;
const epub_utils_1 = require("@reading/epub-utils");
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
 * Parses the EPUB file content received from the fetch-epub artifact.
 * On failure, marks the book as 'failed' in MongoDB before rethrowing.
 */
exports.parseEpubJob = {
    name: 'parse-epub',
    async execute(rawInput, _options, context) {
        const input = rawInput;
        context.logger.info(`Parsing EPUB for book ${input.bookId}`);
        try {
            const epubBuffer = Buffer.from(input.epubBase64, 'base64');
            const { metadata, chapters } = await (0, epub_utils_1.parseEpub)(epubBuffer);
            context.logger.info(`Parsed EPUB for book ${input.bookId}: "${metadata.title}" by "${metadata.author}", ${chapters.length} chapters`);
            const parsedChapters = chapters.map((ch) => ({
                index: ch.index,
                title: ch.title,
                text: ch.text,
            }));
            return {
                bookId: input.bookId,
                metadata,
                chapters: parsedChapters,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error during EPUB parsing';
            context.logger.error(`parse-epub failed for book ${input.bookId}: ${message}`);
            await markBookFailed(input.bookId, message);
            throw error;
        }
    },
};
