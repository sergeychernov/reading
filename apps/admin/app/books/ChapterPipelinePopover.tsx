'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, CircularProgress, Popover } from '@mui/material';
import { PipelineClient } from 'neuroline/client';
import type { PipelineStatusResponse } from 'neuroline';
import { PipelineViewer } from 'neuroline-ui';
import type { PipelineDisplayData, JobDisplayInfo } from 'neuroline-ui';

const PIPELINE_ROUTE = '/api/pipeline/chapter-processing';
const POLL_INTERVAL_MS = 2000;

function statusToDisplayData(s: PipelineStatusResponse): PipelineDisplayData {
	return {
		pipelineId: s.pipelineId,
		pipelineType: s.pipelineType,
		status: s.status as PipelineDisplayData['status'],
		stages: s.stages.map((stage, index) => ({
			index,
			jobs: stage.jobs.map((j) => ({
				name: j.name,
				status: j.status as JobDisplayInfo['status'],
				startedAt: j.startedAt ? new Date(j.startedAt as unknown as string) : undefined,
				finishedAt: j.finishedAt ? new Date(j.finishedAt as unknown as string) : undefined,
				errors: j.errors,
			})),
		})),
		error: s.error,
	};
}

interface ChapterPipelinePopoverProps {
	pipelineId: string;
	anchorEl: HTMLElement | null;
	onClose: () => void;
	onPipelineRestarted?: () => void;
}

export function ChapterPipelinePopover({
	pipelineId,
	anchorEl,
	onClose,
	onPipelineRestarted,
}: ChapterPipelinePopoverProps) {
	const open = Boolean(anchorEl);
	const [pipeline, setPipeline] = useState<PipelineDisplayData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retrying, setRetrying] = useState<string | null>(null);
	const pollingRef = useRef<{ stop: () => void } | null>(null);

	const client = useMemo(
		() => new PipelineClient({
			baseUrl: PIPELINE_ROUTE,
			pollingInterval: POLL_INTERVAL_MS,
		}),
		[],
	);

	const fetchAndDisplay = useCallback(async (silent = false) => {
		if (!silent) {
			setLoading(true);
			setError(null);
		}
		try {
			const status = await client.getStatus(pipelineId);
			setPipeline(statusToDisplayData(status));
		} catch (err) {
			if (!silent) {
				setError(err instanceof Error ? err.message : String(err));
			}
		} finally {
			if (!silent) {
				setLoading(false);
			}
		}
	}, [client, pipelineId]);

	useEffect(() => {
		if (!open) {
			return undefined;
		}
		void fetchAndDisplay();
		return () => {
			pollingRef.current?.stop();
			pollingRef.current = null;
		};
	}, [open, fetchAndDisplay]);

	const isActive = pipeline?.status === 'processing' || pipeline?.status === 'awaiting_manual';

	useEffect(() => {
		if (!open || !isActive) {
			pollingRef.current?.stop();
			pollingRef.current = null;
			return undefined;
		}
		// Always restart when pipelineId (or other deps) change; do not keep polling the previous id.
		pollingRef.current?.stop();
		pollingRef.current = null;

		const { stop, completed } = client.poll(pipelineId, (event) => {
			setPipeline(statusToDisplayData(event.status));
		});
		// neuroline rejects `completed` when `stop()` runs; must catch to avoid uncaught rejections.
		void completed.catch((err) => {
			if (err instanceof Error && err.message === 'Polling stopped') {
				return;
			}
			setError(err instanceof Error ? err.message : String(err));
		});
		pollingRef.current = { stop };

		return () => {
			pollingRef.current?.stop();
			pollingRef.current = null;
		};
	}, [open, isActive, client, pipelineId]);

	const handleJobRetry = useCallback(async (job: JobDisplayInfo) => {
		setRetrying(job.name);
		try {
			pollingRef.current?.stop();
			pollingRef.current = null;

			await client.restart(pipelineId, job.name);
			onPipelineRestarted?.();
			await fetchAndDisplay(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Retry failed');
		} finally {
			setRetrying(null);
		}
	}, [client, pipelineId, fetchAndDisplay, onPipelineRestarted]);

	const handleJobRunManual = useCallback(async (job: JobDisplayInfo) => {
		setRetrying(job.name);
		try {
			pollingRef.current?.stop();
			pollingRef.current = null;

			await client.runManualJob(pipelineId, job.name);
			onPipelineRestarted?.();
			await fetchAndDisplay(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Run failed');
		} finally {
			setRetrying(null);
		}
	}, [client, pipelineId, fetchAndDisplay, onPipelineRestarted]);

	return (
		<Popover
			open={open}
			anchorEl={anchorEl}
			onClose={onClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
			transformOrigin={{ vertical: 'top', horizontal: 'left' }}
			slotProps={{
				paper: {
					sx: { p: 0, minWidth: 320, maxWidth: 420, maxHeight: 480, overflow: 'auto' },
				},
			}}
		>
			{loading && !pipeline && (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
					<CircularProgress size={24} />
				</Box>
			)}
			{error && (
				<Alert severity='error' sx={{ mb: pipeline ? 1 : 0 }}>
					{error}
				</Alert>
			)}
			{pipeline && (
				<Box sx={{ position: 'relative' }}>
					{retrying && (
						<Box
							sx={{
								position: 'absolute',
								inset: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								bgcolor: 'rgba(255,255,255,0.6)',
								zIndex: 1,
								borderRadius: 1,
							}}
						>
							<CircularProgress size={20} />
						</Box>
					)}
					<PipelineViewer
						pipeline={pipeline}
						variant='vertical'
						onJobRetry={handleJobRetry}
						onJobRunManual={handleJobRunManual}
					/>
				</Box>
			)}
		</Popover>
	);
}
