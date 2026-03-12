'use client';

import React, { useEffect, useState } from 'react';
import {
	Alert,
	Box,
	CircularProgress,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import type { SerializedChapter } from '@reading/data';

export function BookChapters({ bookId }: { bookId: string }) {
	const [chapters, setChapters] = useState<SerializedChapter[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError(null);
		fetch(`/api/books/${bookId}/chapters`)
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json();
			})
			.then((data: SerializedChapter[]) => {
				if (!cancelled) setChapters(data);
			})
			.catch((err) => {
				if (!cancelled) setError(String(err));
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [bookId]);

	if (loading) {
		return (
			<Box sx={{ py: 2, px: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
				<CircularProgress size={20} />
				<Typography variant='body2' color='text.secondary'>
					Loading chapters…
				</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ py: 1, px: 2 }}>
				<Alert severity='error'>Failed to load chapters: {error}</Alert>
			</Box>
		);
	}

	if (chapters.length === 0) {
		return (
			<Box sx={{ py: 1, px: 2 }}>
				<Alert severity='info'>No chapters found for this book.</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ py: 1, px: 2 }}>
			<TableContainer component={Paper} variant='outlined' sx={{ maxWidth: 720 }}>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell sx={{ fontWeight: 600, width: 100 }}>#</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
							<TableCell sx={{ fontWeight: 600, width: 120 }}>Status</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{chapters.map((ch) => (
							<TableRow key={ch._id}>
								<TableCell>{ch.chapterIndex + 1}</TableCell>
								<TableCell>
									<Typography variant='body2' sx={{ wordBreak: 'break-word' }}>
										{ch.title || '—'}
									</Typography>
								</TableCell>
								<TableCell>{ch.processingStatus}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}
