import type { BookDocument, ChapterDocument, SerializedBook, SerializedChapter } from './types';

function toIso(d: Date | unknown): string {
	if (d instanceof Date) return d.toISOString();
	return String(d ?? '');
}

export function serializeBook(doc: BookDocument): SerializedBook {
	return {
		_id: doc._id.toHexString(),
		contentHash: doc.contentHash ?? '',
		title: doc.title ?? '',
		author: doc.author ?? '',
		description: doc.description ?? '',
		coverImageUrl: doc.coverImageUrl ?? null,
		epubBlobUrl: doc.epubBlobUrl ?? '',
		audibleUrl: doc.audibleUrl ?? null,
		kindleUrl: doc.kindleUrl ?? null,
		chapterCount: doc.chapterCount ?? 0,
		processingStatus: doc.processingStatus ?? 'unknown',
		processingError: doc.processingError ?? null,
		failed: doc.failed ?? false,
		createdAt: toIso(doc.createdAt),
		updatedAt: toIso(doc.updatedAt),
	};
}

export function serializeChapter(doc: ChapterDocument): SerializedChapter {
	return {
		_id: doc._id.toHexString(),
		bookId: doc.bookId.toHexString(),
		chapterIndex: doc.chapterIndex ?? 0,
		title: doc.title ?? '',
		processingStatus: doc.processingStatus ?? 'unknown',
	};
}
