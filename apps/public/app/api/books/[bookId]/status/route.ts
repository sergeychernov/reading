import { NextResponse } from 'next/server';
import {
	getDb,
	getBookById,
	updateBookStatus,
	markBookChapterBatchFailed,
	getChaptersByBookId,
	countChaptersByStatus,
} from '@reading/data';

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ bookId: string }> },
): Promise<NextResponse> {
	const { bookId } = await params;

	try {
		const db = await getDb();
		const book = await getBookById(db, bookId);
		if (!book) {
			return NextResponse.json(
				{ error: 'Book not found' },
				{ status: 404 },
			);
		}

		const [chapterStats, chapters] = await Promise.all([
			countChaptersByStatus(db, bookId),
			getChaptersByBookId(db, bookId),
		]);

		// Derive terminal book status from per-chapter outcomes (see `failed` on book + chapters).
		if (
			book.processingStatus === 'extracting'
			&& chapterStats.total > 0
		) {
			if (chapterStats.completed === chapterStats.total) {
				await updateBookStatus(db, bookId, 'completed');
			} else if (
				chapterStats.failed > 0
				&& chapterStats.completed + chapterStats.failed === chapterStats.total
			) {
				await markBookChapterBatchFailed(
					db,
					bookId,
					`${chapterStats.failed} of ${chapterStats.total} chapters failed`,
				);
			}
		}

		const bookOut = await getBookById(db, bookId);

		const chapterStatuses = chapters.map((ch) => {
			const legacyChapterStatusFailed =
				(ch.processingStatus as string | undefined) === 'failed';
			return {
				_id: ch._id.toHexString(),
				chapterIndex: ch.chapterIndex,
				title: ch.title ?? '',
				summary: ch.summary ?? null,
				textPreview: ch.textPreview ?? '',
				chapterTextCharCount: ch.chapterTextCharCount,
				processingStatus: ch.processingStatus ?? 'unknown',
				failed: ch.failed === true || legacyChapterStatusFailed,
			};
		});

		return NextResponse.json({
			bookStatus: bookOut?.processingStatus ?? book.processingStatus,
			bookFailed: bookOut?.failed ?? book.failed,
			totalChapters: chapterStats.total,
			completedChapters: chapterStats.completed,
			failedChapters: chapterStats.failed,
			chapters: chapterStatuses,
		});
	} catch (error) {
		console.error('Failed to fetch book status:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch status' },
			{ status: 500 },
		);
	}
}
