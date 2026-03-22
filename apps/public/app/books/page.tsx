import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { getDb, getAllBooks } from '@reading/data';
import { BookGrid } from '../components/BookGrid';

export const dynamic = 'force-dynamic';

export default async function BooksPage() {
	const db = await getDb();
	const books = await getAllBooks(db);

	// Serialize ObjectId to string for client components
	const serializedBooks = books.map((book) => ({
		...book,
		_id: book._id.toHexString(),
	}));

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
				<Typography variant="h4" component="h1">
					Book Library
				</Typography>
				<Link href="/upload">
					<Button variant="contained">
						Upload Book
					</Button>
				</Link>
			</Box>
			<BookGrid books={serializedBooks} />
		</Container>
	);
}
