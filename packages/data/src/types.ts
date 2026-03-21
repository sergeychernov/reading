import type { ObjectId } from 'mongodb';

// ── Book processing status ──────────────────────────────────────────

export type BookProcessingStatus =
	| 'uploading'
	| 'uploaded'
	| 'parsing'
	| 'parsed'
	| 'extracting'
	| 'completed';

// ── Chapter processing status ───────────────────────────────────────

export type ChapterProcessingStatus =
	| 'pending'
	| 'extracting'
	| 'completed';

// ── Language item category ──────────────────────────────────────────

export type LanguageItemCategory = 'idiom' | 'phrasal_verb' | 'rare_word';

// ── Book document (MongoDB) ─────────────────────────────────────────

export interface BookDocument {
	_id: ObjectId;
	/** SHA-256 hex digest of the EPUB file content (unique index). */
	contentHash: string;
	title: string;
	author: string;
	description: string;
	coverImageUrl: string | null;
	audibleUrl: string | null;
	kindleUrl: string | null;
	chapterCount: number;
	processingStatus: BookProcessingStatus;
	processingError: string | null;
	failed: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export type BookInsert = Omit<BookDocument, '_id'>;

// ── Chapter document (MongoDB) ──────────────────────────────────────

/**
 * Chapter row. Core fields are always set at creation; the rest are filled when
 * XHTML/text is parsed and extraction runs.
 */
export interface ChapterDocument {
	_id: ObjectId;
	bookId: ObjectId;
	chapterIndex: number;
	createdAt: Date;
	updatedAt: Date;
	title?: string;
	rawText?: string;
	summary?: string | null;
	rawTextLength?: number;
	processingStatus?: ChapterProcessingStatus;
	failed: boolean;
}

/** Insert shape; `_id` is optional — omit to let MongoDB generate it. */
export type ChapterInsert = Omit<ChapterDocument, '_id'> & { _id?: ObjectId };

// ── Serialized types (JSON-safe, string IDs and ISO dates) ──────────

export interface SerializedBook {
	_id: string;
	contentHash: string;
	title: string;
	author: string;
	description: string;
	coverImageUrl: string | null;
	audibleUrl: string | null;
	kindleUrl: string | null;
	chapterCount: number;
	processingStatus: string;
	processingError: string | null;
	failed: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface SerializedChapter {
	_id: string;
	bookId: string;
	chapterIndex: number;
	title: string;
	processingStatus: string;
	failed: boolean;
}
