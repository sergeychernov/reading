import { NextResponse } from 'next/server';
import { getDb, getBookById, updateBookStatus, getChaptersByBookId, countChaptersByStatus } from '@reading/data';

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

		// Compute effective book status from chapter statuses.
		// Each chapter is processed by an independent chapter-extraction pipeline,
		// so the book status is derived dynamically rather than set by a single job.
		let effectiveStatus = book.processingStatus;

		if (
			book.processingStatus === 'extracting'
			&& chapterStats.total > 0
		) {
			if (chapterStats.completed === chapterStats.total) {
				effectiveStatus = 'completed';
				await updateBookStatus(db, bookId, 'completed');
			} else if (
				chapterStats.failed > 0
				&& chapterStats.completed + chapterStats.failed === chapterStats.total
			) {
				effectiveStatus = 'failed';
				await updateBookStatus(
					db,
					bookId,
					'failed',
					`${chapterStats.failed} of ${chapterStats.total} chapters failed`,
				);
			}
		}

		const chapterStatuses = chapters.map((ch) => {
			const body = ch.rawText.startsWith(ch.title)
				? ch.rawText.slice(ch.title.length).trimStart()
				: ch.rawText;

			const previewLen = 24;
			const textPreview = body.length > previewLen ? body.slice(0, previewLen) + '…' : body.slice(0, previewLen);
			return {
				_id: ch._id.toHexString(),
				chapterIndex: ch.chapterIndex,
				title: ch.title,
				summary: ch.summary,
				textPreview,
				processingStatus: ch.processingStatus,
			};
		});

		return NextResponse.json({
			bookStatus: effectiveStatus,
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
