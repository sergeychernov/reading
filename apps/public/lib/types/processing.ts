export type BookProcessingStatus =
	| 'uploading'
	| 'parsing'
	| 'extracting'
	| 'completed'
	| 'failed';

export type ChapterProcessingStatus =
	| 'pending'
	| 'extracting'
	| 'completed'
	| 'failed';

export type LanguageItemCategory = 'idiom' | 'phrasal_verb' | 'rare_word';
