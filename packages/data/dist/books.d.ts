import { type Db } from 'mongodb';
import type { BookDocument, BookInsert, BookProcessingStatus } from './types';
/** Returns all books except those with processingStatus 'failed', sorted by createdAt DESC. */
export declare function getAllBooks(db: Db): Promise<BookDocument[]>;
/** Returns all books without filtering, sorted by createdAt DESC. */
export declare function getAllBooksAdmin(db: Db): Promise<BookDocument[]>;
export declare function getBookById(db: Db, bookId: string): Promise<BookDocument | null>;
export declare function insertBook(db: Db, book: BookInsert): Promise<string>;
export declare function updateBookStatus(db: Db, bookId: string, status: BookProcessingStatus, error?: string): Promise<void>;
export declare function updateBookChapterCount(db: Db, bookId: string, chapterCount: number): Promise<void>;
export declare function updateBookMeta(db: Db, bookId: string, meta: {
    title: string;
    author: string;
    description: string;
}): Promise<void>;
export declare function updateBookEpubUrl(db: Db, bookId: string, epubBlobUrl: string): Promise<void>;
/** Convenience wrapper — marks a book as 'failed' with the given error message. */
export declare function markBookFailed(db: Db, bookId: string, message: string): Promise<void>;
