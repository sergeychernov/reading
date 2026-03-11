"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookMetaJob = void 0;
const mongodb_1 = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'reading';
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
        const client = new mongodb_1.MongoClient(MONGODB_URI);
        try {
            await client.connect();
            const db = client.db(DB_NAME);
            const bookOid = new mongodb_1.ObjectId(input.bookId);
            const now = new Date();
            await db.collection('books').updateOne({ _id: bookOid }, {
                $set: {
                    title: input.metadata.title,
                    author: input.metadata.author,
                    description: input.metadata.description,
                    processingStatus: 'done',
                    processingError: null,
                    updatedAt: now,
                },
            });
            context.logger.info(`Updated book metadata for ${input.bookId}`);
            return { bookId: input.bookId };
        }
        finally {
            await client.close();
        }
    },
};
