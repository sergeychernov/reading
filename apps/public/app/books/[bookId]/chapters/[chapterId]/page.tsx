import { notFound } from 'next/navigation';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { getChapterById } from '../../../../../lib/db/chapters';
import { getBookById } from '../../../../../lib/db/books';
import { LanguageItemTabs } from '../../../../components/LanguageItemTabs';

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

			<Typography variant="h4" component="h1" gutterBottom>
				{chapter.title}
			</Typography>

			{chapter.summary && (
				<Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
					<Typography variant="subtitle2" gutterBottom>
						Chapter Summary
					</Typography>
					<Typography variant="body1">
						{chapter.summary}
					</Typography>
				</Paper>
			)}

			<Divider sx={{ my: 3 }} />

			<Typography variant="h5" gutterBottom>
				Language Items
			</Typography>

			<LanguageItemTabs chapterId={chapterId} bookId={bookId} />
		</Container>
	);
}
