'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { ProgressIndicator } from '@reading/ui';

interface ProcessingStatusBarProps {
	bookId: string;
	initialStatus: string;
}

interface StatusResponse {
	bookStatus: string;
	totalChapters: number;
	completedChapters: number;
	failedChapters: number;
}

export function ProcessingStatusBar({ bookId, initialStatus }: ProcessingStatusBarProps) {
	const [status, setStatus] = useState<StatusResponse | null>(null);

	const isProcessing = initialStatus === 'uploading'
		|| initialStatus === 'parsing'
		|| initialStatus === 'extracting';

	useEffect(() => {
		if (!isProcessing) return;

		const fetchStatus = async () => {
			try {
				const res = await fetch(`/api/books/${bookId}/status`);
				if (res.ok) {
					const data = await res.json() as StatusResponse;
					setStatus(data);
				}
			} catch {
				// Silently ignore polling errors
			}
		};

		fetchStatus();
		const interval = setInterval(fetchStatus, 3000);

		return () => clearInterval(interval);
	}, [bookId, isProcessing]);

	if (!isProcessing && !status) return null;

	const completed = status?.completedChapters ?? 0;
	const total = status?.totalChapters ?? 0;
	const failed = status?.failedChapters ?? 0;

	if (total === 0) return null;

	return (
		<Box sx={{ mb: 3 }}>
			<ProgressIndicator
				completed={completed}
				total={total}
				failed={failed}
				label="Processing chapters..."
			/>
		</Box>
	);
}
