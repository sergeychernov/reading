'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
	Alert,
	Box,
	Button,
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
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
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
	const [processingBookId, setProcessingBookId] = useState<string | null>(null);
	const [revertingBookId, setRevertingBookId] = useState<string | null>(null);

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

	const updateBookStatus = useCallback((bookId: string, status: string) => {
		setBooks((prev) =>
			prev.map((b) =>
				b._id === bookId ? { ...b, processingStatus: status } : b,
			),
		);
	}, []);

	const handleProcess = useCallback(async (bookId: string) => {
		setProcessingBookId(bookId);
		updateBookStatus(bookId, 'starting...');
		try {
			const startRes = await fetch('/api/pipeline/book-processing', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ bookId }),
			});
			if (!startRes.ok) {
				const body = (await startRes.json()) as { error?: string };
				throw new Error(body.error ?? `HTTP ${startRes.status}`);
			}
			const startData = (await startRes.json()) as {
				data: { pipelineId: string };
			};
			const { pipelineId } = startData.data;

			let finished = false;
			while (!finished) {
				await new Promise((r) => setTimeout(r, 2000));
				const statusRes = await fetch(
					`/api/pipeline/book-processing?action=status&id=${pipelineId}`,
				);
				if (!statusRes.ok) continue;

				const statusData = (await statusRes.json()) as {
					data: {
						status: string;
						currentJobName?: string;
						currentJobIndex?: number;
						totalJobs?: number;
					};
				};
				const pipelineStatus = statusData.data;
				const label = pipelineStatus.currentJobName
					? `${pipelineStatus.status} (${pipelineStatus.currentJobName})`
					: pipelineStatus.status;
				updateBookStatus(bookId, label);

				if (pipelineStatus.status === 'parsed' || pipelineStatus.status === 'error') {
					finished = true;
				}
			}

			await fetchBooks();
		} catch (err) {
			setFetchError(
				err instanceof Error ? err.message : 'Failed to start processing',
			);
		} finally {
			setProcessingBookId(null);
		}
	}, [fetchBooks, updateBookStatus]);

	const handleRevert = useCallback(async (bookId: string) => {
		setRevertingBookId(bookId);
		try {
			const revertRes = await fetch(`/api/books/${bookId}/revert`, {
				method: 'POST',
			});
			if (!revertRes.ok) {
				const body = (await revertRes.json()) as { error?: string };
				throw new Error(body.error ?? `HTTP ${revertRes.status}`);
			}
			await fetchBooks();
		} catch (err) {
			setFetchError(err instanceof Error ? err.message : 'Failed to revert book');
		} finally {
			setRevertingBookId(null);
		}
	}, [fetchBooks]);

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
										<TableCell>
											<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
												{(processingBookId === book._id || revertingBookId === book._id) && (
													<CircularProgress size={14} />
												)}
												{book.processingStatus}
												{book.failed && (
													<>
														<Box
															component='span'
															title='failed'
															sx={{ display: 'inline-flex', alignItems: 'center' }}
														>
															<CloseOutlinedIcon
																fontSize='small'
																sx={{ color: 'error.main' }}
															/>
														</Box>
														
													</>
												)}
												<IconButton
													size='small'
													title='revert'
													disabled={
														processingBookId !== null ||
														revertingBookId !== null
													}
													onClick={(e) => {
														e.stopPropagation();
														handleRevert(book._id);
													}}
												>
													<ReplayOutlinedIcon fontSize='small' />
												</IconButton>
												{book.processingStatus === 'uploaded' && (
													<Button
														size='small'
														variant='outlined'
														startIcon={<PlayArrowOutlinedIcon />}
														disabled={
															processingBookId !== null ||
															revertingBookId !== null
														}
														onClick={(e) => {
															e.stopPropagation();
															handleProcess(book._id);
														}}
													>
														Process
													</Button>
												)}
											</Box>
										</TableCell>
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
