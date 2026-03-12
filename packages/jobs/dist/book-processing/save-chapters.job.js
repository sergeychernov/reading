"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveChaptersJob = void 0;
const mongodb_1 = require("mongodb");
const data_1 = require("@reading/data");
/**
 * Saves parsed EPUB data to MongoDB:
 * - Updates book document with title, author, description
 * - Inserts chapter documents with rawText
 * - Sets book processingStatus to 'extracting'
 */
exports.saveChaptersJob = {
    name: 'save-chapters',
    async execute(rawInput, _options, context) {
        const input = rawInput;
        context.logger.info(`Saving ${input.chapters.length} chapters for book ${input.bookId}`);
        return (0, data_1.withDb)(async (db) => {
            const bookOid = new mongodb_1.ObjectId(input.bookId);
            const now = new Date();
            try {
                await (0, data_1.updateBookMeta)(db, input.bookId, {
                    title: input.metadata.title,
                    author: input.metadata.author,
                    description: input.metadata.description,
                });
                const chapterDocs = input.chapters.map((ch) => ({
                    bookId: bookOid,
                    chapterIndex: ch.index,
                    title: ch.title,
                    rawText: ch.text,
                    summary: null,
                    rawTextLength: ch.text.length,
                    processingStatus: 'pending',
                    createdAt: now,
                    updatedAt: now,
                }));
                const insertResult = await (0, data_1.insertManyChapters)(db, chapterDocs);
                await (0, data_1.updateBookChapterCount)(db, input.bookId, input.chapters.length);
                await (0, data_1.updateBookStatus)(db, input.bookId, 'extracting');
                const insertedIds = insertResult.insertedIds;
                const savedChapters = input.chapters.map((ch, i) => ({
                    chapterId: insertedIds[i].toHexString(),
                    index: ch.index,
                    title: ch.title,
                    text: ch.text,
                }));
                context.logger.info(`Saved ${savedChapters.length} chapters for book ${input.bookId}, status set to 'extracting'`);
                return {
                    bookId: input.bookId,
                    chapters: savedChapters,
                };
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error while saving chapters';
                context.logger.error(`save-chapters failed for book ${input.bookId}: ${message}`);
                await (0, data_1.markBookFailed)(db, input.bookId, message);
                throw error;
            }
        });
    },
};
