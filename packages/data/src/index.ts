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
	updateBookCoverUrl,
	updateBookMeta,
	markBookUploaded,
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
	epubBlobKey,
	bookFileKey,
	uploadEpub,
	downloadEpub,
	downloadBlob,
	uploadBookFile,
	deleteBlob,
	deleteBookProcessingArtifacts,
} from './blob';

// Serialization
export { serializeBook, serializeChapter } from './serialization';

// Utilities
export { computeContentHash } from './hash';
