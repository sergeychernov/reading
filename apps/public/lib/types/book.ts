import type { ObjectId } from 'mongodb';
import type { BookProcessingStatus } from './processing';

export interface BookDocument {
	_id: ObjectId;
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
