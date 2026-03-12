"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBooks = getAllBooks;
exports.getAllBooksAdmin = getAllBooksAdmin;
exports.getBookById = getBookById;
exports.insertBook = insertBook;
exports.updateBookStatus = updateBookStatus;
exports.updateBookChapterCount = updateBookChapterCount;
exports.updateBookMeta = updateBookMeta;
exports.updateBookEpubUrl = updateBookEpubUrl;
exports.markBookFailed = markBookFailed;
const mongodb_1 = require("mongodb");
const COLLECTION = 'books';
function col(db) {
    return db.collection(COLLECTION);
}
/** Returns all books except those with processingStatus 'failed', sorted by createdAt DESC. */
async function getAllBooks(db) {
    return col(db)
        .find({ processingStatus: { $ne: 'failed' } })
        .sort({ createdAt: -1 })
        .toArray();
}
/** Returns all books without filtering, sorted by createdAt DESC. */
async function getAllBooksAdmin(db) {
    return col(db)
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
}
async function getBookById(db, bookId) {
    return col(db).findOne({ _id: new mongodb_1.ObjectId(bookId) });
}
async function insertBook(db, book) {
    const result = await col(db).insertOne(book);
    return result.insertedId.toHexString();
}
async function updateBookStatus(db, bookId, status, error) {
    await col(db).updateOne({ _id: new mongodb_1.ObjectId(bookId) }, {
        $set: {
            processingStatus: status,
            processingError: error ?? null,
            updatedAt: new Date(),
        },
    });
}
async function updateBookChapterCount(db, bookId, chapterCount) {
    await col(db).updateOne({ _id: new mongodb_1.ObjectId(bookId) }, {
        $set: {
            chapterCount,
            updatedAt: new Date(),
        },
    });
}
async function updateBookMeta(db, bookId, meta) {
    await col(db).updateOne({ _id: new mongodb_1.ObjectId(bookId) }, {
        $set: {
            title: meta.title,
            author: meta.author,
            description: meta.description,
            updatedAt: new Date(),
        },
    });
}
async function updateBookEpubUrl(db, bookId, epubBlobUrl) {
    await col(db).updateOne({ _id: new mongodb_1.ObjectId(bookId) }, { $set: { epubBlobUrl, updatedAt: new Date() } });
}
/** Convenience wrapper — marks a book as 'failed' with the given error message. */
async function markBookFailed(db, bookId, message) {
    await updateBookStatus(db, bookId, 'failed', message);
}
