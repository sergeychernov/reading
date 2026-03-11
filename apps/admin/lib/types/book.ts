/**
 * Book document as returned by admin API (serialized for JSON).
 */
export interface AdminBook {
	_id: string;
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

/**
 * Chapter list item as returned by admin API GET /api/books/[bookId]/chapters.
 */
export interface AdminChapterListItem {
	_id: string;
	chapterIndex: number;
	title: string;
	processingStatus: string;
}
