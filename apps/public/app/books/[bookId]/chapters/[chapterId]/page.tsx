import { notFound } from 'next/navigation';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { getChapterById } from '../../../../../lib/db/chapters';
import { getBookById } from '../../../../../lib/db/books';
import { ChapterDetailClient } from './ChapterDetailClient';

interface ChapterDetailPageProps {
	params: Promise<{ bookId: string; chapterId: string }>;
}

export default async function ChapterDetailPage({ params }: ChapterDetailPageProps) {
	const { bookId, chapterId } = await params;

	const [book, chapter] = await Promise.all([
		getBookById(bookId),
		getChapterById(chapterId),
	]);

	if (!book || !chapter) {
		notFound();
	}

	const body = chapter.rawText.startsWith(chapter.title)
		? chapter.rawText.slice(chapter.title.length).trimStart()
		: chapter.rawText;
	const previewLen = 24;
	const textPreview = body.length > previewLen ? body.slice(0, previewLen) + '…' : body.slice(0, previewLen);

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Link href={`/books/${bookId}`}>
				<Button
					startIcon={<ArrowBackIcon />}
					sx={{ mb: 2 }}
				>
					Back to {book.title}
				</Button>
			</Link>

			<ChapterDetailClient
				bookId={bookId}
				chapterId={chapterId}
				chapterIndex={chapter.chapterIndex}
				chapterTitle={chapter.title}
				textPreview={textPreview || null}
				summary={chapter.summary}
			/>
		</Container>
	);
}
