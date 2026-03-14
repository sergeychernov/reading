'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
	Alert,
	Box,
	CircularProgress,
	Collapse,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import type { SerializedBook } from '@reading/data';
import { AdminPageContent } from '@reading/ui';
import { BookMeta } from './BookMeta';
import { BookChapters } from './BookChapters';

interface BooksClientProps {
	refreshToken: number;
}

export function BooksClient({ refreshToken }: BooksClientProps) {
	const [books, setBooks] = useState<SerializedBook[]>([]);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [expandedMetaId, setExpandedMetaId] = useState<string | null>(null);
	const [expandedChaptersId, setExpandedChaptersId] = useState<string | null>(null);

	const fetchBooks = useCallback(async () => {
		setLoading(true);
		setFetchError(null);
		try {
			const res = await fetch('/api/books');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = (await res.json()) as SerializedBook[];
			setBooks(data);
		} catch (err) {
			setFetchError(String(err));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchBooks();
	}, [fetchBooks, refreshToken]);

	if (loading) {
		return (
			<Box display='flex' justifyContent='center' py={8}>
				<CircularProgress />
			</Box>
		);
	}

	if (fetchError) {
		return (
			<Alert severity='error' sx={{ mt: 2 }}>
				Failed to load books: {fetchError}
			</Alert>
		);
	}

	return (
		<AdminPageContent>
			<Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
				{books.length} book{books.length !== 1 ? 's' : ''}
			</Typography>

			{books.length === 0 ? (
				<Alert severity='info'>No books found.</Alert>
			) : (
				<TableContainer component={Paper} variant='outlined'>
					<Table size='small'>
						<TableHead>
							<TableRow>
								<TableCell padding='checkbox' sx={{ width: 48 }} />
								<TableCell>Title</TableCell>
								<TableCell>Author</TableCell>
								<TableCell>Status</TableCell>
								<TableCell align='right'>Chapters</TableCell>
								<TableCell>Created</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{books.map((book) => (
								<React.Fragment key={book._id}>
									<TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
										<TableCell padding='checkbox'>
											<IconButton
												size='small'
												aria-label='Show metadata'
												title='Metadata'
												onClick={(e) => {
													e.stopPropagation();
													setExpandedMetaId((id) => (id === book._id ? null : book._id));
												}}
												color={expandedMetaId === book._id ? 'primary' : 'default'}
											>
												<InfoOutlinedIcon />
											</IconButton>
										</TableCell>
										<TableCell>{book.title || '—'}</TableCell>
										<TableCell>{book.author || '—'}</TableCell>
										<TableCell>{book.processingStatus}</TableCell>
										<TableCell align='right'>
											<Box
												component='span'
												sx={{
													display: 'inline-flex',
													alignItems: 'center',
													justifyContent: 'flex-end',
													gap: 0.5,
												}}
											>
												{book.chapterCount}
												<IconButton
													size='small'
													aria-label='Show chapters'
													title='Chapters'
													onClick={(e) => {
														e.stopPropagation();
														setExpandedChaptersId((id) =>
															id === book._id ? null : book._id,
														);
													}}
													color={expandedChaptersId === book._id ? 'primary' : 'default'}
												>
													<FormatListBulletedOutlinedIcon />
												</IconButton>
											</Box>
										</TableCell>
										<TableCell>
											<Typography variant='body2' color='text.secondary'>
												{book.createdAt}
											</Typography>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell colSpan={6} sx={{ py: 0, borderBottom: 0 }}>
											<Collapse in={expandedMetaId === book._id} unmountOnExit>
												<BookMeta book={book} />
											</Collapse>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell colSpan={6} sx={{ py: 0, borderBottom: 0 }}>
											<Collapse in={expandedChaptersId === book._id} unmountOnExit>
												<BookChapters bookId={book._id} />
											</Collapse>
										</TableCell>
									</TableRow>
								</React.Fragment>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}

		</AdminPageContent>
	);
}
