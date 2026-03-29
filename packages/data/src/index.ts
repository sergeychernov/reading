// Types
export type {
	BookDocument,
	BookInsert,
	BookProcessingStatus,
	ChapterDocument,
	ChapterInsert,
	ChapterKind,
	ChapterProcessingStatus,
	LanguageItemCategory,
	SerializedBook,
	SerializedChapter,
} from './types';

export type { ChapterExtractFields } from './chapters';

// Connection
export { DB_NAME, getClientPromise, getDb, withDb } from './connection';

// Book operations
export {
	getAllBooks,
	getAllBooksAdmin,
	getBookById,
	deleteBookById,
	insertBook,
	updateBookStatus,
	updateBookChapterCount,
	updateBookCoverUrl,
	updateBookMeta,
	markBookUploaded,
	markBookFailed,
	markBookChapterBatchFailed,
} from './books';

// Chapter operations
export {
	getChaptersByBookId,
	getChapterById,
	insertManyChapters,
	updateChapterStatus,
	setChapterPipelineId,
	updateChapterExtractFields,
	completeChapterProcessing,
	updateChapterSummary,
	countChaptersByStatus,
	getPendingChapters,
	deleteChaptersByBookId,
} from './chapters';

// Language items (MongoDB collection used by pipeline / public app)
export { deleteLanguageItemsByBookId } from './language-items';

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
	deleteAllBookStorage,
} from './blob';

// Serialization
export {
	serializeBook,
	serializeChapter,
	chapterRawBodyForPreview,
} from './serialization';

// Utilities
export { computeContentHash } from './hash';
