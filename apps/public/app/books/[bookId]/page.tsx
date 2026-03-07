import { notFound } from 'next/navigation';
import Container from '@mui/material/Container';
import { getBookById } from '../../../lib/db/books';
import { getChaptersByBookId } from '../../../lib/db/chapters';
import { BookHeader } from '../../components/BookHeader';
import { BookContent } from '../../components/BookContent';

interface BookDetailPageProps {
	params: Promise<{ bookId: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
	const { bookId } = await params;
	const book = await getBookById(bookId);

	if (!book) {
		notFound();
	}

	const chapters = await getChaptersByBookId(bookId);

	const serializedChapters = chapters.map((ch) => {
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

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<BookHeader
				title={book.title}
				author={book.author}
				description={book.description}
				processingStatus={book.processingStatus}
				audibleUrl={book.audibleUrl}
				kindleUrl={book.kindleUrl}
			/>

			<BookContent
				bookId={bookId}
				initialStatus={book.processingStatus}
				initialChapters={serializedChapters}
			/>
		</Container>
	);
}
