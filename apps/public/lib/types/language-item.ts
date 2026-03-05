import type { ObjectId } from 'mongodb';
import type { LanguageItemCategory } from './processing';

export interface LanguageItemDocument {
	_id: ObjectId;
	bookId: ObjectId;
	chapterId: ObjectId;
	category: LanguageItemCategory;
	term: string;
	meaning: string;
	exampleFromBook: string;
	createdAt: Date;
}

export type LanguageItemInsert = Omit<LanguageItemDocument, '_id'>;
