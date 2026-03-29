'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
	Alert,
	Box,
	CircularProgress,
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
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import TocOutlinedIcon from '@mui/icons-material/TocOutlined';
import type { ChapterKind, SerializedChapter } from '@reading/data';
import { ChapterPipelinePopover } from './ChapterPipelinePopover';

function contentChapterStatsLine(ch: SerializedChapter): string | null {
	if (ch.chapterKind !== 'content') {
		return null;
	}
	const w = ch.chapterTextWordCount;
	const c = ch.chapterTextCharCount;
	if (w === undefined && c === undefined) {
		return null;
	}
	const parts: string[] = [];
	if (typeof w === 'number') {
		parts.push(`${w.toLocaleString()}`);
	}
	if (typeof c === 'number') {
		parts.push(`${c.toLocaleString()}`);
	}
	return parts.length > 0 ? parts.join('/') : null;
}

function chapterKindIcon(kind: ChapterKind | undefined): {
	Icon: typeof ImageOutlinedIcon;
	title: string;
} | null {
	switch (kind) {
		case 'cover':
			return { Icon: ImageOutlinedIcon, title: 'Cover' };
		case 'table-of-contents':
			return { Icon: TocOutlinedIcon, title: 'Table of contents' };
		case 'content':
			return { Icon: ArticleOutlinedIcon, title: 'Content' };
		default:
			return null;
	}
}

export function BookChapters({ bookId }: { bookId: string }) {
	const [chapters, setChapters] = useState<SerializedChapter[]>([]);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [startingChapterId, setStartingChapterId] = useState<string | null>(null);
	const [pipelinePopover, setPipelinePopover] = useState<{
		anchorEl: HTMLElement;
		pipelineId: string;
	} | null>(null);

	const fetchChapters = useCallback(async (silent = false): Promise<void> => {
		if (!silent) {
			setLoading(true);
			setFetchError(null);
		}
		try {
			const res = await fetch(`/api/books/${bookId}/chapters`);
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}`);
			}
			const data = await res.json() as SerializedChapter[];
			setChapters(data);
		} catch (err) {
			setFetchError(String(err));
		} finally {
			if (!silent) {
				setLoading(false);
			}
		}
	}, [bookId]);

	useEffect(() => {
		void fetchChapters();
	}, [fetchChapters]);

	useEffect(() => {
		const hasRunning = chapters.some((ch) => ch.processingStatus === 'extracting');
		if (!hasRunning) {
			return undefined;
		}
		const timer = window.setInterval(() => {
			void fetchChapters(true);
		}, 2000);
		return () => {
			window.clearInterval(timer);
		};
	}, [chapters, fetchChapters]);

	const handleStartPipeline = useCallback(async (chapter: SerializedChapter) => {
		setActionError(null);
		setStartingChapterId(chapter._id);
		setChapters((prev) => prev.map((item) =>
			item._id === chapter._id
				? { ...item, processingStatus: 'extracting', failed: false }
				: item,
		));

		try {
			const res = await fetch('/api/pipeline/chapter-processing', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chapterId: chapter._id,
				}),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => null) as { error?: string } | null;
				throw new Error(body?.error ?? `HTTP ${res.status}`);
			}

			const startData = await res.json() as { data?: { pipelineId?: string } };
			const pipelineId = startData.data?.pipelineId;
			if (typeof pipelineId === 'string' && pipelineId.length > 0) {
				setChapters((prev) => prev.map((item) =>
					item._id === chapter._id ? { ...item, pipelineId } : item,
				));
			}
			await fetchChapters(true);
		} catch (err) {
			setActionError(err instanceof Error ? err.message : 'Failed to start chapter pipeline');
			await fetchChapters(true);
		} finally {
			setStartingChapterId(null);
		}
	}, [bookId, fetchChapters]);

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

	if (fetchError) {
		return (
			<Box sx={{ py: 1, px: 2 }}>
				<Alert severity='error'>Failed to load chapters: {fetchError}</Alert>
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
			{actionError && (
				<Alert severity='error' sx={{ mb: 1 }}>
					Failed to start chapter pipeline: {actionError}
				</Alert>
			)}
			<TableContainer component={Paper} variant='outlined' sx={{ maxWidth: 920 }}>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell sx={{ fontWeight: 600, width: 100 }}>#</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
							<TableCell sx={{ fontWeight: 600, width: 44, textAlign: 'center' }} />
							<TableCell sx={{ fontWeight: 600, width: 140 }}>Words / chars</TableCell>
							<TableCell sx={{ fontWeight: 600, width: 120 }}>Status</TableCell>
							<TableCell sx={{ fontWeight: 600, width: 100 }}>Action</TableCell>
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
								<TableCell sx={{ textAlign: 'center', verticalAlign: 'middle' }}>
									{(() => {
										const kindUi = chapterKindIcon(ch.chapterKind);
										if (!kindUi) {
											return null;
										}
										const { Icon, title } = kindUi;
										return (
											<Box
												component='span'
												title={title}
												aria-label={title}
												sx={{
													display: 'inline-flex',
													alignItems: 'center',
													color: 'text.secondary',
												}}
											>
												<Icon fontSize='small' aria-hidden />
											</Box>
										);
									})()}
								</TableCell>
								<TableCell sx={{ verticalAlign: 'middle' }}>
									{ch.chapterKind === 'content' ? (
										<Typography variant='body2' color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>
											{contentChapterStatsLine(ch) ?? '—'}
										</Typography>
									) : null}
								</TableCell>
								<TableCell>
									{ch.failed ? `${ch.processingStatus} (error)` : ch.processingStatus}
								</TableCell>
								<TableCell>
									{ch.processingStatus === 'pending' && (
										<IconButton
											size='small'
											title='Start Pipeline'
											disabled={startingChapterId !== null}
											onClick={() => {
												void handleStartPipeline(ch);
											}}
										>
											{startingChapterId === ch._id ? (
												<CircularProgress size={16} />
											) : (
												<PlayArrowOutlinedIcon fontSize='small' />
											)}
										</IconButton>
									)}
									{ch.processingStatus !== 'pending' && ch.pipelineId && (
										<IconButton
											size='small'
											title='View Pipeline'
											onClick={(e) => {
												setPipelinePopover({
													anchorEl: e.currentTarget,
													pipelineId: ch.pipelineId!,
												});
											}}
										>
											<AccountTreeOutlinedIcon fontSize='small' />
										</IconButton>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			{pipelinePopover && (
				<ChapterPipelinePopover
					pipelineId={pipelinePopover.pipelineId}
					anchorEl={pipelinePopover.anchorEl}
					onClose={() => setPipelinePopover(null)}
					onPipelineRestarted={() => void fetchChapters(true)}
				/>
			)}
		</Box>
	);
}
