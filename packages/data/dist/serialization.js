"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeBook = serializeBook;
exports.serializeChapter = serializeChapter;
function toIso(d) {
    if (d instanceof Date)
        return d.toISOString();
    return String(d ?? '');
}
function serializeBook(doc) {
    return {
        _id: doc._id.toHexString(),
        contentHash: doc.contentHash ?? '',
        title: doc.title ?? '',
        author: doc.author ?? '',
        description: doc.description ?? '',
        coverImageUrl: doc.coverImageUrl ?? null,
        epubBlobUrl: doc.epubBlobUrl ?? '',
        audibleUrl: doc.audibleUrl ?? null,
        kindleUrl: doc.kindleUrl ?? null,
        chapterCount: doc.chapterCount ?? 0,
        processingStatus: doc.processingStatus ?? 'unknown',
        processingError: doc.processingError ?? null,
        createdAt: toIso(doc.createdAt),
        updatedAt: toIso(doc.updatedAt),
    };
}
function serializeChapter(doc) {
    return {
        _id: doc._id.toHexString(),
        bookId: doc.bookId.toHexString(),
        chapterIndex: doc.chapterIndex ?? 0,
        title: doc.title ?? '',
        processingStatus: doc.processingStatus ?? 'unknown',
    };
}
