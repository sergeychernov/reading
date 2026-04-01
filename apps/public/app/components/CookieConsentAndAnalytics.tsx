'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const CONSENT_STORAGE_KEY = 'reading_site_consent';
const CONSENT_VERSION = 1;

interface ConsentRecord {
	version: number;
	analytics: boolean;
}

type ConsentPhase = 'pending' | 'ready';

function readStoredConsent(): ConsentRecord | null {
	if (typeof window === 'undefined') {
		return null;
	}
	try {
		const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
		if (!raw) {
			return null;
		}
		const parsed = JSON.parse(raw) as unknown;
		if (
			typeof parsed !== 'object' ||
			parsed === null ||
			!('version' in parsed) ||
			!('analytics' in parsed)
		) {
			return null;
		}
		const record = parsed as ConsentRecord;
		if (record.version !== CONSENT_VERSION || typeof record.analytics !== 'boolean') {
			return null;
		}
		return record;
	} catch {
		return null;
	}
}

function persistConsent(analytics: boolean): void {
	const record: ConsentRecord = { version: CONSENT_VERSION, analytics };
	localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
}

interface Props {
	/**
	 * Whether the user's jurisdiction requires explicit consent before loading analytics
	 * (EEA, UK, Switzerland). Determined server-side from x-vercel-ip-country header.
	 * When false, analytics loads immediately without showing the banner.
	 */
	requiresConsent: boolean;
}

/**
 * Loads Vercel Web Analytics, with a GDPR consent banner shown only to users
 * in jurisdictions that require it (EEA, UK, CH).
 */
export function CookieConsentAndAnalytics({ requiresConsent }: Props) {
	const [phase, setPhase] = useState<ConsentPhase>('pending');
	const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
	const [showBanner, setShowBanner] = useState(false);

	useEffect(() => {
		if (!requiresConsent) {
			setAnalyticsEnabled(true);
			setPhase('ready');
			return;
		}
		const stored = readStoredConsent();
		if (stored === null) {
			setShowBanner(true);
			setPhase('ready');
			return;
		}
		setAnalyticsEnabled(stored.analytics);
		setPhase('ready');
	}, [requiresConsent]);

	const acceptAnalytics = () => {
		persistConsent(true);
		setAnalyticsEnabled(true);
		setShowBanner(false);
	};

	const essentialOnly = () => {
		persistConsent(false);
		setAnalyticsEnabled(false);
		setShowBanner(false);
	};

	return (
		<>
			{phase === 'ready' && analyticsEnabled ? <Analytics /> : null}
			{showBanner ? (
				<Paper
					elevation={8}
					role='dialog'
					aria-describedby='cookie-consent-desc'
					sx={(theme) => ({
						position: 'fixed',
						zIndex: theme.zIndex.snackbar,
						left: 0,
						right: 0,
						bottom: 0,
						p: 1.5,
						borderTop: `1px solid ${theme.palette.divider}`,
						borderRadius: 0,
					})}
				>
					<Stack direction='row' spacing={1.5} alignItems='center'>
						<Typography
							id='cookie-consent-desc'
							variant='body2'
							color='text.secondary'
							sx={{ flex: 1, minWidth: 0 }}
						>
							We use optional analytics to understand traffic. See our{' '}
							<Link component={NextLink} href='/privacy' underline='hover'>
								Privacy Policy
							</Link>
							.
						</Typography>
						<Button
							variant='outlined'
							color='inherit'
							size='small'
							onClick={essentialOnly}
							sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
						>
							Essential only
						</Button>
						<Button
							variant='contained'
							size='small'
							onClick={acceptAnalytics}
							sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
						>
							Accept analytics
						</Button>
					</Stack>
				</Paper>
			) : null}
		</>
	);
}
