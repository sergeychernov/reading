'use client';

import { useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Divider,
	FormControl,
	FormControlLabel,
	FormLabel,
	InputLabel,
	ListSubheader,
	MenuItem,
	Paper,
	Radio,
	RadioGroup,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import type { LlmConfig } from '../../lib/types/llm-config';
import { DEFAULT_LLM_CONFIG, getGroupedGatewayModels } from '../../lib/types/llm-config';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function LlmConfigForm() {
	const [config, setConfig] = useState<LlmConfig>(DEFAULT_LLM_CONFIG);
	const [loading, setLoading] = useState(true);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
	const groupedModels = useMemo(() => getGroupedGatewayModels(), []);

	useEffect(() => {
		fetch('/api/llm-config')
			.then((res) => res.json() as Promise<LlmConfig>)
			.then((data) => setConfig(data))
			.finally(() => setLoading(false));
	}, []);

	const handleSave = async () => {
		setSaveStatus('saving');
		try {
			const res = await fetch('/api/llm-config', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(config),
			});
			setSaveStatus(res.ok ? 'saved' : 'error');
		} catch {
			setSaveStatus('error');
		}
	};

	if (loading) {
		return (
			<Box display='flex' justifyContent='center' py={6}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Paper variant='outlined' sx={{ p: 4 }}>
			<Typography variant='h6' gutterBottom>
				LLM Adapter
			</Typography>

			<FormControl component='fieldset' sx={{ mb: 3 }}>
				<FormLabel component='legend'>Adapter</FormLabel>
				<RadioGroup
					value={config.adapter}
					onChange={(e) => {
						const nextAdapter = e.target.value as LlmConfig['adapter'];
						setConfig((prev) => ({
							...prev,
							adapter: nextAdapter,
							...(nextAdapter === 'gateway' && {
								gateway: {
									model: prev.gateway?.model || DEFAULT_LLM_CONFIG.gateway.model,
									maxTokens: prev.gateway?.maxTokens ?? DEFAULT_LLM_CONFIG.gateway.maxTokens,
								},
							}),
						}));
					}}
				>
					<FormControlLabel value='gateway' control={<Radio />} label='Gateway (Vercel AI Gateway)' />
					<FormControlLabel value='stub' control={<Radio />} label='Stub (test data, no API calls)' />
				</RadioGroup>
			</FormControl>

			{config.adapter === 'gateway' && (
				<>
					<Divider sx={{ mb: 3 }} />
					<Typography variant='subtitle2' color='text.secondary' gutterBottom>
						Gateway settings
					</Typography>
					<Box display='flex' flexDirection='column' gap={3}>
						<FormControl fullWidth>
							<InputLabel id='model-label'>Model</InputLabel>
							<Select
								labelId='model-label'
								label='Model'
								value={config.gateway?.model ?? ''}
								onChange={(e) =>
									setConfig((prev) => ({
										...prev,
										gateway: { ...prev.gateway, model: e.target.value },
									}))
								}
								MenuProps={{
									PaperProps: { sx: { maxHeight: 400 } },
									disableScrollLock: true,
								}}
							>
								{groupedModels.flatMap((provider) => [
									<ListSubheader key={provider.providerKey} sx={{ fontWeight: 600, lineHeight: 2 }}>
										{provider.providerLabel}
									</ListSubheader>,
									...provider.versions.flatMap((ver) => [
										<ListSubheader
											key={`${provider.providerKey}-${ver.versionLabel}`}
											sx={{ pl: 2, fontWeight: 500, fontSize: '0.8rem' }}
										>
											{ver.versionLabel}
										</ListSubheader>,
										...ver.models.map((m) => (
											<MenuItem key={m.id} value={m.id} sx={{ pl: 4 }}>
												{m.label.replace(/\s*\([^)]+\)\s*$/, '')}
											</MenuItem>
										)),
									]),
								])}
							</Select>
						</FormControl>
						<TextField
							label='Max tokens'
							type='number'
							value={config.gateway?.maxTokens ?? 4096}
							onChange={(e) =>
								setConfig((prev) => ({
									...prev,
									gateway: { ...prev.gateway, maxTokens: Number(e.target.value) },
								}))
							}
							slotProps={{ htmlInput: { min: 256, max: 16384, step: 256 } }}
						/>
					</Box>
				</>
			)}

			<Box mt={4} display='flex' alignItems='center' gap={2}>
				<Button
					variant='contained'
					onClick={handleSave}
					disabled={saveStatus === 'saving'}
					startIcon={saveStatus === 'saving' ? <CircularProgress size={16} color='inherit' /> : undefined}
				>
					Save
				</Button>
				{saveStatus === 'saved' && (
					<Alert severity='success' sx={{ py: 0 }}>
						Saved
					</Alert>
				)}
				{saveStatus === 'error' && (
					<Alert severity='error' sx={{ py: 0 }}>
						Failed to save
					</Alert>
				)}
			</Box>
		</Paper>
	);
}
