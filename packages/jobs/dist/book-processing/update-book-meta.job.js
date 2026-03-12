"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookMetaJob = void 0;
const data_1 = require("@reading/data");
/**
 * Updates only book metadata in MongoDB from parsed EPUB (title, author, description).
 * Also sets processingStatus to 'done' and clears processingError on success.
 * Does not touch chapters. Used by book-reprocessing pipeline in admin.
 */
exports.updateBookMetaJob = {
    name: 'update-book-meta',
    async execute(rawInput, _options, context) {
        const input = rawInput;
        context.logger.info(`Updating book metadata for ${input.bookId}`);
        await (0, data_1.withDb)(async (db) => {
            await (0, data_1.updateBookMeta)(db, input.bookId, {
                title: input.metadata.title,
                author: input.metadata.author,
                description: input.metadata.description,
            });
            await (0, data_1.updateBookStatus)(db, input.bookId, 'completed');
        });
        context.logger.info(`Updated book metadata for ${input.bookId}`);
        return { bookId: input.bookId };
    },
};
