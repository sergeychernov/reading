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
	Switch,
	Tab,
	Tabs,
	TextField,
	Typography,
} from '@mui/material';
import type { LlmAdapterConfig, LlmConfig, LlmJobName } from '../../lib/types/llm-config';
import {
	DEFAULT_LLM_CONFIG,
	getGroupedGatewayModels,
	LLM_JOB_NAMES,
} from '../../lib/types/llm-config';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type ConfigTab = 'default' | LlmJobName;

const JOB_TAB_TITLES: Record<LlmJobName, string> = {
	'extract-summary': 'Job: extract-summary',
	'extract-idioms': 'Job: extract-idioms',
	'extract-phrasal-verbs': 'Job: extract-phrasal-verbs',
	'extract-rare-words': 'Job: extract-rare-words',
	'extract-rarity': 'Job: extract-rarity',
	'extract-meaning-en': 'Job: extract-meaning-en',
	'extract-meaning-ru': 'Job: extract-meaning-ru',
};

export function LlmConfigForm() {
	const [config, setConfig] = useState<LlmConfig>(DEFAULT_LLM_CONFIG);
	const [activeTab, setActiveTab] = useState<ConfigTab>('default');
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

	const updateDefaultConfig = (updater: (prev: LlmAdapterConfig) => LlmAdapterConfig) => {
		setConfig((prev) => ({
			...prev,
			default: updater(prev.default),
		}));
	};

	const updateJobConfig = (
		jobName: LlmJobName,
		updater: (prev: LlmAdapterConfig) => LlmAdapterConfig,
	) => {
		setConfig((prev) => ({
			...prev,
			jobs: {
				...(prev.jobs ?? {}),
				[jobName]: updater(prev.jobs?.[jobName] ?? prev.default),
			},
		}));
	};

	const activeConfig = activeTab === 'default'
		? config.default
		: config.jobs?.[activeTab] ?? config.default;
	const isUsingDefaultForJob = activeTab !== 'default' && !config.jobs?.[activeTab];

	const setUseDefaultForActiveJob = (useDefault: boolean) => {
		if (activeTab === 'default') {
			return;
		}
		if (useDefault) {
			setConfig((prev) => {
				const nextJobs = { ...(prev.jobs ?? {}) };
				delete nextJobs[activeTab];
				return {
					...prev,
					jobs: nextJobs,
				};
			});
			return;
		}
		setConfig((prev) => ({
			...prev,
			jobs: {
				...(prev.jobs ?? {}),
				[activeTab]: prev.jobs?.[activeTab] ?? prev.default,
			},
		}));
	};

	const updateActiveConfig = (updater: (prev: LlmAdapterConfig) => LlmAdapterConfig) => {
		if (activeTab === 'default') {
			updateDefaultConfig(updater);
			return;
		}
		updateJobConfig(activeTab, updater);
	};

	if (loading) {
		return (
			<Box display='flex' justifyContent='center' py={6}>
				<CircularProgress />
			</Box>
		);
	}

	const isGatewayEnabled = activeConfig.adapter === 'gateway';

	return (
		<Paper variant='outlined' sx={{ p: 4 }}>
			<Typography variant='h6' gutterBottom>
				LLM Adapter
			</Typography>
			<Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
				Default settings apply to all jobs. Job tabs override defaults only for that job.
			</Typography>

			<Tabs
				value={activeTab}
				onChange={(_e, value: ConfigTab) => setActiveTab(value)}
				variant='scrollable'
				allowScrollButtonsMobile
				sx={{ mb: 3 }}
			>
				<Tab value='default' label='Default' />
				{LLM_JOB_NAMES.map((jobName) => (
					<Tab key={jobName} value={jobName} label={JOB_TAB_TITLES[jobName]} />
				))}
			</Tabs>

			{activeTab !== 'default' && (
				<Box sx={{ mb: 3 }}>
					<FormControlLabel
						control={
							<Switch
								checked={isUsingDefaultForJob}
								onChange={(e) => setUseDefaultForActiveJob(e.target.checked)}
							/>
						}
						label='Use default settings for this job'
					/>
					{isUsingDefaultForJob && (
						<Alert severity='info' sx={{ mt: 1 }}>
							This job now uses the configuration from the Default tab.
						</Alert>
					)}
				</Box>
			)}

			<FormControl component='fieldset' sx={{ mb: 3 }} disabled={isUsingDefaultForJob}>
				<FormLabel component='legend'>Adapter</FormLabel>
				<RadioGroup
					value={activeConfig.adapter}
					row
					sx={{
						flexDirection: { xs: 'column', lg: 'row' },
						gap: { lg: 3 },
					}}
					onChange={(e) => {
						const nextAdapter = e.target.value as LlmAdapterConfig['adapter'];
						updateActiveConfig((prev) => ({
							...prev,
							adapter: nextAdapter,
							...(nextAdapter === 'gateway' && {
								gateway: {
									model:
										prev.gateway?.model || DEFAULT_LLM_CONFIG.default.gateway.model,
									maxTokens:
										prev.gateway?.maxTokens ??
										DEFAULT_LLM_CONFIG.default.gateway.maxTokens,
									temperature:
										prev.gateway?.temperature ??
										DEFAULT_LLM_CONFIG.default.gateway.temperature ??
										0.2,
								},
							}),
						}));
					}}
				>
					<FormControlLabel value='gateway' control={<Radio />} label='Gateway (Vercel AI Gateway)' />
					<FormControlLabel value='stub' control={<Radio />} label='Stub (test data, no API calls)' />
				</RadioGroup>
			</FormControl>

			{isGatewayEnabled && (
				<>
					<Divider sx={{ mb: 3 }} />
					<Typography variant='subtitle2' color='text.secondary' gutterBottom>
						Gateway settings
					</Typography>
					<Box
						display='flex'
						flexDirection={{ xs: 'column', lg: 'row' }}
						alignItems='flex-start'
						gap={3}
					>
						<FormControl fullWidth sx={{ flex: { lg: 2 } }}>
							<InputLabel id='model-label'>Model</InputLabel>
							<Select
								labelId='model-label'
								label='Model'
								value={activeConfig.gateway?.model ?? ''}
								disabled={isUsingDefaultForJob}
								onChange={(e) =>
									updateActiveConfig((prev) => ({
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
							fullWidth
							label='Max tokens'
							type='number'
							sx={{ flex: { lg: 1 } }}
							value={activeConfig.gateway?.maxTokens ?? 4096}
							disabled={isUsingDefaultForJob}
							onChange={(e) =>
								updateActiveConfig((prev) => ({
									...prev,
									gateway: { ...prev.gateway, maxTokens: Number(e.target.value) },
								}))
							}
							slotProps={{ htmlInput: { min: 256, max: 16384, step: 256 } }}
						/>
						<TextField
							fullWidth
							label='Temperature'
							type='number'
							helperText='0–2. Lower = more deterministic. 0.2 recommended for extraction.'
							sx={{ flex: { lg: 1 } }}
							value={activeConfig.gateway?.temperature ?? 0.2}
							disabled={isUsingDefaultForJob}
							onChange={(e) =>
								updateActiveConfig((prev) => ({
									...prev,
									gateway: { ...prev.gateway, temperature: Number(e.target.value) },
								}))
							}
							slotProps={{ htmlInput: { min: 0, max: 2, step: 0.1 } }}
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
