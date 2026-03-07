'use client';

import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { ProgressIndicator } from '@reading/ui';
import { ChapterList } from './ChapterList';

interface ChapterData {
	_id: string;
	chapterIndex: number;
	title: string;
	summary: string | null;
	textPreview: string;
	processingStatus: string;
}

interface StatusResponse {
	bookStatus: string;
	totalChapters: number;
	completedChapters: number;
	failedChapters: number;
	chapters: ChapterData[];
}

interface BookContentProps {
	bookId: string;
	initialStatus: string;
	initialChapters: ChapterData[];
}

/**
 * Client component that manages live polling of book processing status.
 * Keeps both the progress bar and chapter list in sync.
 */
export function BookContent({
	bookId,
	initialStatus,
	initialChapters,
}: BookContentProps) {
	const [bookStatus, setBookStatus] = useState(initialStatus);
	const [chapters, setChapters] = useState<ChapterData[]>(initialChapters);
	const [completed, setCompleted] = useState(0);
	const [total, setTotal] = useState(initialChapters.length);
	const [failed, setFailed] = useState(0);

	const isProcessing = bookStatus === 'uploading'
		|| bookStatus === 'parsing'
		|| bookStatus === 'extracting';

	const fetchStatus = useCallback(async () => {
		try {
			const res = await fetch(`/api/books/${bookId}/status`);
			if (!res.ok) return;

			const data = await res.json() as StatusResponse;

			setBookStatus(data.bookStatus);
			setCompleted(data.completedChapters);
			setTotal(data.totalChapters);
			setFailed(data.failedChapters);

			if (data.chapters && data.chapters.length > 0) {
				setChapters(data.chapters);
			}
		} catch {
			// Silently ignore polling errors
		}
	}, [bookId]);

	useEffect(() => {
		if (!isProcessing) return;

		// Fetch immediately on mount
		fetchStatus();

		const interval = setInterval(fetchStatus, 3000);
		return () => clearInterval(interval);
	}, [fetchStatus, isProcessing]);

	return (
		<>
			{(isProcessing || completed > 0) && total > 0 && (
				<Box sx={{ mb: 3 }}>
					<ProgressIndicator
						completed={completed}
						total={total}
						failed={failed}
						label={isProcessing ? 'Processing chapters...' : 'Processing complete'}
					/>
				</Box>
			)}

			<Divider sx={{ my: 3 }} />

			<Typography variant="h5" gutterBottom>
				Chapters
			</Typography>

			<ChapterList bookId={bookId} chapters={chapters} />
		</>
	);
}
