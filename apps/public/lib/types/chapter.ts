import type { ObjectId } from 'mongodb';
import type { ChapterProcessingStatus } from './processing';

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
