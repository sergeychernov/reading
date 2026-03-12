import { type Db, type InsertManyResult } from 'mongodb';
import type { ChapterDocument, ChapterInsert, ChapterProcessingStatus } from './types';
export declare function getChaptersByBookId(db: Db, bookId: string): Promise<ChapterDocument[]>;
export declare function getChapterById(db: Db, chapterId: string): Promise<ChapterDocument | null>;
/**
 * Inserts multiple chapter documents and returns the InsertManyResult
 * so callers can access insertedIds.
 */
export declare function insertManyChapters(db: Db, chapters: ChapterInsert[]): Promise<InsertManyResult>;
export declare function updateChapterStatus(db: Db, chapterId: string, status: ChapterProcessingStatus): Promise<void>;
export declare function updateChapterSummary(db: Db, chapterId: string, summary: string): Promise<void>;
export declare function countChaptersByStatus(db: Db, bookId: string): Promise<{
    total: number;
    completed: number;
    failed: number;
}>;
export declare function getPendingChapters(db: Db, bookId: string, startIndex: number, limit: number): Promise<ChapterDocument[]>;
