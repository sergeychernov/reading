import type { ObjectId } from 'mongodb';
import type { MeaningTranslations } from '@reading/llm-schemas';
import type { LanguageItemCategory } from '@reading/data';

export interface LanguageItemDocument {
	_id: ObjectId;
	bookId: ObjectId;
	chapterId: ObjectId;
	category: LanguageItemCategory;
	term: string;
	meaning: MeaningTranslations;
	exampleFromBook: string;
	/** Rarity 0–10 from extraction; may be missing in older documents. */
	rarity?: number;
	createdAt: Date;
}

export type LanguageItemInsert = Omit<LanguageItemDocument, '_id'>;
