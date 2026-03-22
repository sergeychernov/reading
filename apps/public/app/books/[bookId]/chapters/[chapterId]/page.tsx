import { notFound } from 'next/navigation';
import Container from '@mui/material/Container';
import {
	getDb,
	getChapterById,
	getChaptersByBookId,
	getBookById,
	chapterRawBodyForPreview,
} from '@reading/data';
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

	const body = chapterRawBodyForPreview(chapter);
	const previewLen = 24;
	const textPreview = body.length > previewLen ? body.slice(0, previewLen) + '…' : body.slice(0, previewLen);
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
				canReprocess={canReprocess}
			/>
		</Container>
	);
}
