"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEpubJob = void 0;
const epub_utils_1 = require("@reading/epub-utils");
const data_1 = require("@reading/data");
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
            await (0, data_1.withDb)((db) => (0, data_1.markBookFailed)(db, input.bookId, message));
            throw error;
        }
    },
};
