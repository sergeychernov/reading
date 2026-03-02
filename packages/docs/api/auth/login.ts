/**
 * Redirects to GitHub OAuth. State is optional; callback will redirect back to /.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';

export default function handler(req: VercelRequest, res: VercelResponse): void {
	const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
	if (!clientId) {
		res.status(500).send('GITHUB_OAUTH_CLIENT_ID is not configured');
		return;
	}

	const baseUrl = process.env.VERCEL_URL
		? `https://${process.env.VERCEL_URL}`
		: process.env.URL || 'http://localhost:3000';
	const resolvedRedirectUri =
		process.env.GITHUB_OAUTH_REDIRECT_URI ||
		`${baseUrl.replace(/\/$/, '')}/api/auth/callback`;

	const state = typeof req.query.state === 'string' ? req.query.state : undefined;
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: resolvedRedirectUri,
		scope: 'read:user',
		...(state && { state }),
	});

	res.redirect(302, `${GITHUB_AUTH_URL}?${params.toString()}`);
}
