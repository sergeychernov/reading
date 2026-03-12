import { notFound } from 'next/navigation';
import Container from '@mui/material/Container';
import { getDb, getChapterById, getChaptersByBookId, getBookById } from '@reading/data';
import { auth } from '../../../../../auth';
import { getUserByEmail } from '../../../../../lib/db/users';
import { ChapterDetailClient } from './ChapterDetailClient';

interface ChapterDetailPageProps {
	params: Promise<{ bookId: string; chapterId: string }>;
}

export default async function ChapterDetailPage({ params }: ChapterDetailPageProps) {
	const { bookId, chapterId } = await params;
	const session = await auth();
	const user = session?.user?.email
		? await getUserByEmail(session.user.email)
		: null;
	const canReprocess = user?.subscription === 'pro';

	const db = await getDb();
	const [book, chapter, chapters] = await Promise.all([
		getBookById(db, bookId),
		getChapterById(db, chapterId),
		getChaptersByBookId(db, bookId),
	]);

	if (!book || !chapter) {
		notFound();
	}

	const body = chapter.rawText.startsWith(chapter.title)
		? chapter.rawText.slice(chapter.title.length).trimStart()
		: chapter.rawText;
	const previewLen = 24;
	const textPreview = body.length > previewLen ? body.slice(0, previewLen) + '…' : body.slice(0, previewLen);
	const nextChapter = chapters.find((item) => item.chapterIndex === chapter.chapterIndex + 1);

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<ChapterDetailClient
				bookId={bookId}
				bookTitle={book.title}
				chapterId={chapterId}
				chapterIndex={chapter.chapterIndex}
				chapterTitle={chapter.title}
				textPreview={textPreview || null}
				nextChapterId={nextChapter?._id.toString() ?? null}
				summary={chapter.summary}
				canReprocess={canReprocess}
			/>
		</Container>
	);
}
