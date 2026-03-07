'use client';

import { useEffect, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Divider,
	FormControlLabel,
	Paper,
	Snackbar,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import type { BookListItem } from '../api/pipeline/books/route';
import type { PipelineConfig } from '../../lib/db/pipeline-config';

type DispatchStatus = 'idle' | 'dispatching' | 'done' | 'error';

interface BookRowState {
	status: DispatchStatus;
	message: string | null;
}

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
	parsing: 'warning',
	extracting: 'info',
	ready: 'success',
	error: 'error',
};

function statusChipColor(status: string): 'default' | 'warning' | 'info' | 'success' | 'error' {
	return STATUS_COLORS[status] ?? 'default';
}

export function PipelineSettingsClient() {
	const [books, setBooks] = useState<BookListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [rowStates, setRowStates] = useState<Record<string, BookRowState>>({});
	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
		open: false,
		message: '',
		severity: 'success',
	});

	const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig>({ autoDispatchChapters: false });
	const [configLoading, setConfigLoading] = useState(true);
	const [configSaving, setConfigSaving] = useState(false);

	useEffect(() => {
		fetch('/api/pipeline/config')
			.then((res) => res.json() as Promise<PipelineConfig>)
			.then((data) => setPipelineConfig(data))
			.finally(() => setConfigLoading(false));
	}, []);

	const handleAutoDispatchToggle = async (checked: boolean) => {
		const next: PipelineConfig = { ...pipelineConfig, autoDispatchChapters: checked };
		setPipelineConfig(next);
		setConfigSaving(true);
		try {
			const res = await fetch('/api/pipeline/config', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(next),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			setSnackbar({ open: true, message: 'Settings saved', severity: 'success' });
		} catch (err) {
			setPipelineConfig((prev) => ({ ...prev, autoDispatchChapters: !checked }));
			setSnackbar({ open: true, message: String(err), severity: 'error' });
		} finally {
			setConfigSaving(false);
		}
	};

	const fetchBooks = async () => {
		setLoading(true);
		setFetchError(null);
		try {
			const res = await fetch('/api/pipeline/books');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json() as BookListItem[];
			setBooks(data);
		} catch (err) {
			setFetchError(String(err));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBooks();
	}, []);

	const handleDispatch = async (book: BookListItem) => {
		setRowStates((prev) => ({
			...prev,
			[book.id]: { status: 'dispatching', message: null },
		}));

		try {
			const res = await fetch(`/api/pipeline/books/${book.id}/dispatch`, {
				method: 'POST',
			});
			const data = await res.json() as { dispatched: number; errors: number; errorMessages?: string[] };

			if (!res.ok) {
				throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
			}

			const msg = `Dispatched ${data.dispatched} chapters${data.errors > 0 ? `, ${data.errors} errors` : ''}`;
			setRowStates((prev) => ({
				...prev,
				[book.id]: { status: 'done', message: msg },
			}));
			setSnackbar({ open: true, message: msg, severity: data.errors > 0 ? 'error' : 'success' });
		} catch (err) {
			const msg = String(err);
			setRowStates((prev) => ({
				...prev,
				[book.id]: { status: 'error', message: msg },
			}));
			setSnackbar({ open: true, message: msg, severity: 'error' });
		}
	};

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
		<Box>
			<Paper variant='outlined' sx={{ p: 3, mb: 4 }}>
				<Typography variant='h6' gutterBottom>
					Settings
				</Typography>
				<Divider sx={{ mb: 2 }} />
				<Box display='flex' alignItems='center' justifyContent='space-between'>
					<Box>
						<Typography variant='body2' fontWeight={500}>
							Auto-dispatch chapters
						</Typography>
						<Typography variant='caption' color='text.secondary'>
							Automatically start chapter-extraction pipelines after a book is parsed
						</Typography>
					</Box>
					{configLoading ? (
						<CircularProgress size={20} />
					) : (
						<FormControlLabel
							control={
								<Switch
									checked={pipelineConfig.autoDispatchChapters}
									onChange={(e) => handleAutoDispatchToggle(e.target.checked)}
									disabled={configSaving}
								/>
							}
							label={pipelineConfig.autoDispatchChapters ? 'Enabled' : 'Disabled'}
							labelPlacement='start'
							sx={{ mr: 0 }}
						/>
					)}
				</Box>
			</Paper>

			<Box display='flex' alignItems='center' justifyContent='space-between' mb={3}>
				<Box>
					<Typography variant='h6'>Books</Typography>
					<Typography variant='body2' color='text.secondary'>
						Manually dispatch chapter extraction for any book
					</Typography>
				</Box>
				<Button
					size='small'
					startIcon={<RefreshOutlinedIcon />}
					onClick={fetchBooks}
					variant='outlined'
				>
					Refresh
				</Button>
			</Box>

			{books.length === 0 ? (
				<Alert severity='info'>No books found in the database.</Alert>
			) : (
				<TableContainer component={Paper} variant='outlined'>
					<Table size='small'>
						<TableHead>
							<TableRow>
								<TableCell>Title / Author</TableCell>
								<TableCell>Status</TableCell>
								<TableCell align='right'>Chapters</TableCell>
								<TableCell align='right'>Created</TableCell>
								<TableCell align='right'>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{books.map((book) => {
								const rowState = rowStates[book.id];
								const dispatching = rowState?.status === 'dispatching';
								const doneMsg = rowState?.message ?? null;

								return (
									<TableRow key={book.id}>
										<TableCell>
											<Typography variant='body2' fontWeight={500}>
												{book.title ?? <em style={{ opacity: 0.5 }}>Untitled</em>}
											</Typography>
											{book.author && (
												<Typography variant='caption' color='text.secondary'>
													{book.author}
												</Typography>
											)}
										</TableCell>
										<TableCell>
											<Chip
												label={book.processingStatus}
												color={statusChipColor(book.processingStatus)}
												size='small'
												variant='outlined'
											/>
										</TableCell>
										<TableCell align='right'>
											<Typography variant='body2'>{book.chapterCount}</Typography>
										</TableCell>
										<TableCell align='right'>
											<Typography variant='body2' color='text.secondary'>
												{new Date(book.createdAt).toLocaleDateString()}
											</Typography>
										</TableCell>
										<TableCell align='right'>
											<Box display='flex' alignItems='center' justifyContent='flex-end' gap={1}>
												{doneMsg && (
													<Tooltip title={doneMsg}>
														<Typography
															variant='caption'
															color={rowState?.status === 'error' ? 'error' : 'success.main'}
															sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
														>
															{doneMsg}
														</Typography>
													</Tooltip>
												)}
												<Button
													size='small'
													variant='contained'
													startIcon={dispatching
														? <CircularProgress size={14} color='inherit' />
														: <PlayArrowOutlinedIcon />
													}
													disabled={dispatching || book.chapterCount === 0}
													onClick={() => handleDispatch(book)}
												>
													Dispatch
												</Button>
											</Box>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
