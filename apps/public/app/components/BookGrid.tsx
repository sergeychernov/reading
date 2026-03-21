import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { BookCard } from './BookCard';

interface BookData {
	_id: string;
	title: string;
	author: string;
	chapterCount: number;
	processingStatus: string;
	failed?: boolean;
}

interface BookGridProps {
	books: BookData[];
}

export function BookGrid({ books }: BookGridProps) {
	if (books.length === 0) {
		return (
			<Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
				No books yet. Upload an EPUB to get started.
			</Typography>
		);
	}

	return (
		<Grid container spacing={3}>
			{books.map((book) => (
				<Grid key={book._id} size={{ xs: 12, sm: 6, md: 4 }}>
					<BookCard
						id={book._id}
						title={book.title}
						author={book.author}
						chapterCount={book.chapterCount}
						processingStatus={book.processingStatus}
						failed={book.failed}
					/>
				</Grid>
			))}
		</Grid>
	);
}
