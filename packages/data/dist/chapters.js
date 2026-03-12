"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChaptersByBookId = getChaptersByBookId;
exports.getChapterById = getChapterById;
exports.insertManyChapters = insertManyChapters;
exports.updateChapterStatus = updateChapterStatus;
exports.updateChapterSummary = updateChapterSummary;
exports.countChaptersByStatus = countChaptersByStatus;
exports.getPendingChapters = getPendingChapters;
const mongodb_1 = require("mongodb");
const COLLECTION = 'chapters';
function col(db) {
    return db.collection(COLLECTION);
}
async function getChaptersByBookId(db, bookId) {
    return col(db)
        .find({ bookId: new mongodb_1.ObjectId(bookId) })
        .sort({ chapterIndex: 1 })
        .toArray();
}
async function getChapterById(db, chapterId) {
    return col(db).findOne({ _id: new mongodb_1.ObjectId(chapterId) });
}
/**
 * Inserts multiple chapter documents and returns the InsertManyResult
 * so callers can access insertedIds.
 */
async function insertManyChapters(db, chapters) {
    return col(db).insertMany(chapters);
}
async function updateChapterStatus(db, chapterId, status) {
    await col(db).updateOne({ _id: new mongodb_1.ObjectId(chapterId) }, {
        $set: {
            processingStatus: status,
            updatedAt: new Date(),
        },
    });
}
async function updateChapterSummary(db, chapterId, summary) {
    await col(db).updateOne({ _id: new mongodb_1.ObjectId(chapterId) }, {
        $set: {
            summary,
            updatedAt: new Date(),
        },
    });
}
async function countChaptersByStatus(db, bookId) {
    const c = col(db);
    const bookOid = new mongodb_1.ObjectId(bookId);
    const [total, completed, failed] = await Promise.all([
        c.countDocuments({ bookId: bookOid }),
        c.countDocuments({ bookId: bookOid, processingStatus: 'completed' }),
        c.countDocuments({ bookId: bookOid, processingStatus: 'failed' }),
    ]);
    return { total, completed, failed };
}
async function getPendingChapters(db, bookId, startIndex, limit) {
    return col(db)
        .find({
        bookId: new mongodb_1.ObjectId(bookId),
        chapterIndex: { $gte: startIndex },
        processingStatus: { $in: ['pending', 'failed'] },
    })
        .sort({ chapterIndex: 1 })
        .limit(limit)
        .toArray();
}
