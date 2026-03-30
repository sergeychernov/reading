import { notFound } from 'next/navigation';
import Container from '@mui/material/Container';
import {
	getDb,
	getChapterById,
	getChaptersByBookId,
	getBookById,
} from '@reading/data';
import { chapterPreviewLine } from '../../../../../lib/chapter-preview-display';
import { ChapterDetailClient } from './ChapterDetailClient';

interface ChapterDetailPageProps {
	params: Promise<{ bookId: string; chapterId: string }>;
}

export default async function ChapterDetailPage({ params }: ChapterDetailPageProps) {
	const { bookId, chapterId } = await params;

	const db = await getDb();
	const [book, chapter, chapters] = await Promise.all([
		getBookById(db, bookId),
		getChapterById(db, chapterId),
		getChaptersByBookId(db, bookId),
	]);

	if (!book || !chapter) {
		notFound();
	}

	const textPreview = chapterPreviewLine(
		chapter.textPreview ?? '',
		chapter.chapterTextCharCount,
	);
	const nextChapter = chapters.find((item) => item.chapterIndex === chapter.chapterIndex + 1);
	const chapterTitle = chapter.title ?? `Chapter ${chapter.chapterIndex + 1}`;

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<ChapterDetailClient
				bookId={bookId}
				bookTitle={book.title}
				chapterId={chapterId}
				chapterIndex={chapter.chapterIndex}
				chapterTitle={chapterTitle}
				textPreview={textPreview || null}
				nextChapterId={nextChapter?._id.toString() ?? null}
				summary={chapter.summary ?? null}
			/>
		</Container>
	);
}
