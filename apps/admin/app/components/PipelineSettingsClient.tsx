'use client';

import { useEffect, useState } from 'react';
import {
	Alert,
	Box,
	CircularProgress,
	Divider,
	FormControlLabel,
	Paper,
	Snackbar,
	Switch,
	Typography,
} from '@mui/material';

interface PipelineConfig {
	autoDispatchChapters: boolean;
}

export function PipelineSettingsClient() {
	const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig>({ autoDispatchChapters: false });
	const [configLoading, setConfigLoading] = useState(true);
	const [configSaving, setConfigSaving] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
		open: false,
		message: '',
		severity: 'success',
	});

	useEffect(() => {
		fetch('/api/pipeline/config')
			.then(async (res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json() as Promise<PipelineConfig>;
			})
			.then((data) => {
				setPipelineConfig(data);
				setLoadError(null);
			})
			.catch((err: unknown) => {
				setLoadError(String(err));
			})
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

	return (
		<Paper variant='outlined' sx={{ p: 3 }}>
			<Typography variant='h6' gutterBottom>
				Pipeline
			</Typography>
			<Divider sx={{ mb: 2 }} />
			{loadError ? (
				<Alert severity='error'>Failed to load pipeline settings: {loadError}</Alert>
			) : (
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
		</Paper>
	);
}
