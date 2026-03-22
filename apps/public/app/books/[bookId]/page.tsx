import { notFound } from 'next/navigation';
import Container from '@mui/material/Container';
import { getDb, getBookById, getChaptersByBookId, chapterRawBodyForPreview } from '@reading/data';
import { BookHeader } from '../../components/BookHeader';
import { BookContent } from '../../components/BookContent';

interface BookDetailPageProps {
	params: Promise<{ bookId: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
	const { bookId } = await params;
	const db = await getDb();
	const book = await getBookById(db, bookId);

	if (!book) {
		notFound();
	}

	const chapters = await getChaptersByBookId(db, bookId);

	const serializedChapters = chapters.map((ch) => {
		const body = chapterRawBodyForPreview(ch);
		const previewLen = 24;
		const textPreview = body.length > previewLen ? body.slice(0, previewLen) + '…' : body.slice(0, previewLen);
		const legacyChapterStatusFailed =
			(ch.processingStatus as string | undefined) === 'failed';

		return {
			_id: ch._id.toHexString(),
			chapterIndex: ch.chapterIndex,
			title: ch.title ?? '',
			summary: ch.summary ?? null,
			textPreview,
			processingStatus: ch.processingStatus ?? 'unknown',
			failed: ch.failed === true || legacyChapterStatusFailed,
		};
	});

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<BookHeader
				title={book.title}
				author={book.author}
				description={book.description}
				processingStatus={book.processingStatus}
				failed={book.failed}
				audibleUrl={book.audibleUrl}
				kindleUrl={book.kindleUrl}
			/>

			<BookContent
				bookId={bookId}
				initialStatus={book.processingStatus}
				initialBookFailed={book.failed}
				initialChapters={serializedChapters}
			/>
		</Container>
	);
}
