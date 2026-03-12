// Types
export type {
	BookDocument,
	BookInsert,
	BookProcessingStatus,
	ChapterDocument,
	ChapterInsert,
	ChapterProcessingStatus,
	LanguageItemCategory,
	SerializedBook,
	SerializedChapter,
} from './types';

// Connection
export { DB_NAME, getClientPromise, getDb, withDb } from './connection';

// Book operations
export {
	getAllBooks,
	getAllBooksAdmin,
	getBookById,
	insertBook,
	updateBookStatus,
	updateBookChapterCount,
	updateBookMeta,
	updateBookEpubUrl,
	markBookFailed,
} from './books';

// Chapter operations
export {
	getChaptersByBookId,
	getChapterById,
	insertManyChapters,
	updateChapterStatus,
	updateChapterSummary,
	countChaptersByStatus,
	getPendingChapters,
} from './chapters';

// Blob operations
export {
	uploadEpub,
	downloadEpub,
	uploadCoverImage,
	deleteBlob,
} from './blob';

// Serialization
export { serializeBook, serializeChapter } from './serialization';

// Utilities
export { computeContentHash } from './hash';
