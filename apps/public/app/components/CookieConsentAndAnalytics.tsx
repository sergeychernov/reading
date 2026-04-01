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

interface ConsentState {
	analyticsEnabled: boolean;
	showBanner: boolean;
	ready: boolean;
}

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
	try {
		const record: ConsentRecord = { version: CONSENT_VERSION, analytics };
		localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
	} catch {
		// localStorage may be unavailable in private browsing or when storage is blocked.
		// The user's choice is still applied for the current session via setState.
	}
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
	const [state, setState] = useState<ConsentState>({
		analyticsEnabled: false,
		showBanner: false,
		ready: false,
	});

	useEffect(() => {
		if (!requiresConsent) {
			setState({ analyticsEnabled: true, showBanner: false, ready: true });
			return;
		}
		const stored = readStoredConsent();
		if (stored === null) {
			setState({ analyticsEnabled: false, showBanner: true, ready: true });
			return;
		}
		setState({ analyticsEnabled: stored.analytics, showBanner: false, ready: true });
	}, [requiresConsent]);

	const acceptAnalytics = () => {
		persistConsent(true);
		setState({ analyticsEnabled: true, showBanner: false, ready: true });
	};

	const essentialOnly = () => {
		persistConsent(false);
		setState({ analyticsEnabled: false, showBanner: false, ready: true });
	};

	return (
		<>
			{state.ready && state.analyticsEnabled ? <Analytics /> : null}
			{state.showBanner ? (
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

