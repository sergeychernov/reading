'use client';

import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import {
	TRANSLATION_LANGUAGE_OPTIONS,
	type TranslationLanguage,
} from '../../lib/types/user';

interface ProfileClientProps {
	userName: string;
	userEmail: string;
	userImage: string | null;
}

export function ProfileClient({ userName, userEmail, userImage }: ProfileClientProps) {
	const [translationLanguage, setTranslationLanguage] = useState<TranslationLanguage | ''>('');
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const res = await fetch('/api/profile');
				if (res.ok) {
					const data = await res.json() as { translationLanguage: TranslationLanguage | null };
					setTranslationLanguage(data.translationLanguage ?? '');
				}
			} catch {
				// ignore
			} finally {
				setLoading(false);
			}
		};
		void fetchProfile();
	}, []);

	const handleSave = async () => {
		if (!translationLanguage) return;
		setSaving(true);
		setSuccess(false);
		setError(null);
		try {
			const res = await fetch('/api/profile', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ translationLanguage }),
			});
			if (res.ok) {
				setSuccess(true);
			} else {
				setError('Failed to save. Please try again.');
			}
		} catch {
			setError('Network error. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	return (
		<Container maxWidth='sm' sx={{ py: 6 }}>
			<Typography variant='h4' fontWeight={700} gutterBottom>
				Profile
			</Typography>

			<Paper variant='outlined' sx={{ p: 3, mb: 4 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Avatar
						src={userImage ?? undefined}
						alt={userName}
						sx={{ width: 56, height: 56 }}
					/>
					<Box>
						<Typography variant='subtitle1' fontWeight={600}>
							{userName}
						</Typography>
						<Typography variant='body2' color='text.secondary'>
							{userEmail}
						</Typography>
					</Box>
				</Box>
			</Paper>

			<Divider sx={{ mb: 4 }} />

			<Typography variant='h6' gutterBottom>
				Settings
			</Typography>

			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
					<CircularProgress size={32} />
				</Box>
			) : (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<TextField
					select
					label='Translation Language'
					value={translationLanguage}
					onChange={(e) => {
						setTranslationLanguage(e.target.value as TranslationLanguage);
						setSuccess(false);
					}}
					helperText='Language used for word meanings and translations.'
					fullWidth
				>
					{TRANSLATION_LANGUAGE_OPTIONS.map((lang) => (
						<MenuItem key={lang.value} value={lang.value}>
							{lang.label}
						</MenuItem>
					))}
				</TextField>

					{success && (
						<Alert severity='success'>Settings saved successfully.</Alert>
					)}
					{error && (
						<Alert severity='error'>{error}</Alert>
					)}

				<Button
					variant='contained'
					onClick={handleSave}
					disabled={saving || !translationLanguage}
						sx={{ alignSelf: 'flex-start' }}
					>
						{saving ? 'Saving…' : 'Save'}
					</Button>
				</Box>
			)}
		</Container>
	);
}
