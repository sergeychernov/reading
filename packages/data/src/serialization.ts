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
	const legacyStatusFailed =
		(doc as { processingStatus?: string }).processingStatus === 'failed';
	return {
		_id: doc._id.toHexString(),
		bookId: doc.bookId.toHexString(),
		chapterIndex: doc.chapterIndex ?? 0,
		pipelineId: doc.pipelineId,
		chapterKind: doc.chapterKind,
		title: doc.title ?? '',
		chapterTextCharCount: doc.chapterTextCharCount,
		chapterTextWordCount: doc.chapterTextWordCount,
		processingStatus: doc.processingStatus ?? 'unknown',
		failed: doc.failed ?? legacyStatusFailed,
	};
}

/**
 * Plain-text body for UI previews: if rawText starts with title, strip that prefix.
 */
export function chapterRawBodyForPreview(doc: Pick<ChapterDocument, 'rawText' | 'title'>): string {
	const rawText = doc.rawText ?? '';
	const title = doc.title ?? '';
	if (!rawText) {
		return '';
	}
	return title && rawText.startsWith(title)
		? rawText.slice(title.length).trimStart()
		: rawText;
}
