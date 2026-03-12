import type { ObjectId } from 'mongodb';
export type BookProcessingStatus = 'uploading' | 'parsing' | 'extracting' | 'completed' | 'failed';
export type ChapterProcessingStatus = 'pending' | 'extracting' | 'completed' | 'failed';
export type LanguageItemCategory = 'idiom' | 'phrasal_verb' | 'rare_word';
export interface BookDocument {
    _id: ObjectId;
    /** SHA-256 hex digest of the EPUB file content (unique index). */
    contentHash: string;
    title: string;
    author: string;
    description: string;
    coverImageUrl: string | null;
    epubBlobUrl: string;
    audibleUrl: string | null;
    kindleUrl: string | null;
    chapterCount: number;
    processingStatus: BookProcessingStatus;
    processingError: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export type BookInsert = Omit<BookDocument, '_id'>;
export interface ChapterDocument {
    _id: ObjectId;
    bookId: ObjectId;
    chapterIndex: number;
    title: string;
    rawText: string;
    summary: string | null;
    rawTextLength: number;
    processingStatus: ChapterProcessingStatus;
    createdAt: Date;
    updatedAt: Date;
}
export type ChapterInsert = Omit<ChapterDocument, '_id'>;
export interface SerializedBook {
    _id: string;
    contentHash: string;
    title: string;
    author: string;
    description: string;
    coverImageUrl: string | null;
    epubBlobUrl: string;
    audibleUrl: string | null;
    kindleUrl: string | null;
    chapterCount: number;
    processingStatus: string;
    processingError: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface SerializedChapter {
    _id: string;
    bookId: string;
    chapterIndex: number;
    title: string;
    processingStatus: string;
}
