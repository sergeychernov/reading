import { Container, Typography, Box } from '@mui/material';
import { BooksClient } from './BooksClient';

export default function BooksPage() {
	return (
		<Container maxWidth='xl' sx={{ py: 6 }}>
			<Box mb={4}>
				<Typography variant='h4' component='h1' gutterBottom>
					Books
				</Typography>
				<Typography variant='body2' color='text.secondary'>
					All books from the library with full metadata
				</Typography>
			</Box>
			<BooksClient />
		</Container>
	);
}
