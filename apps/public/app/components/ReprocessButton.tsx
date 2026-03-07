'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import ReplayIcon from '@mui/icons-material/Replay';

interface ReprocessButtonProps {
	bookId: string;
	chapterId: string;
	/** Called when pipeline has finished (status completed). Use to refresh dependent data (e.g. language items list). */
	onDone?: () => void;
}

type Status = 'idle' | 'loading' | 'processing' | 'done' | 'error';

const POLL_INTERVAL_MS = 2000;

export function ReprocessButton({ bookId, chapterId, onDone }: ReprocessButtonProps) {
	const [status, setStatus] = useState<Status>('idle');
	const router = useRouter();
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		return () => {
			if (pollRef.current !== null) clearInterval(pollRef.current);
		};
	}, []);

	const stopPolling = () => {
		if (pollRef.current !== null) {
			clearInterval(pollRef.current);
			pollRef.current = null;
		}
	};

	const startPolling = () => {
		pollRef.current = setInterval(async () => {
			try {
				const res = await fetch(`/api/books/${bookId}/chapters/${chapterId}`);
				if (!res.ok) return;
				const chapter = await res.json() as { processingStatus: string };

				if (chapter.processingStatus === 'completed') {
					stopPolling();
					setStatus('done');
					router.refresh();
					onDone?.();
					setTimeout(() => setStatus('idle'), 2000);
				} else if (chapter.processingStatus === 'failed') {
					stopPolling();
					setStatus('error');
				}
			} catch {
				// ignore transient poll errors
			}
		}, POLL_INTERVAL_MS);
	};

	const handleClick = async () => {
		setStatus('loading');
		try {
			const res = await fetch(
				`/api/books/${bookId}/chapters/${chapterId}/reprocess`,
				{ method: 'POST' },
			);
			if (res.ok) {
				setStatus('processing');
				startPolling();
			} else {
				setStatus('error');
			}
		} catch {
			setStatus('error');
		}
	};

	const label: Record<Status, string> = {
		idle: 'Reprocess',
		loading: 'Starting…',
		processing: 'Processing…',
		done: 'Done',
		error: 'Error — retry?',
	};

	const isSpinning = status === 'loading' || status === 'processing';

	return (
		<Tooltip title='Re-run LLM extraction with current adapter settings from admin'>
			<span>
				<Button
					variant='outlined'
					size='small'
					color={status === 'error' ? 'error' : status === 'done' ? 'success' : 'primary'}
					disabled={isSpinning || status === 'done'}
					startIcon={isSpinning ? <CircularProgress size={14} color='inherit' /> : <ReplayIcon />}
					onClick={handleClick}
				>
					{label[status]}
				</Button>
			</span>
		</Tooltip>
	);
}
