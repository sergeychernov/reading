/**
 * GitHub OAuth callback: exchange code for token, fetch user, set session cookie, redirect to /.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { COOKIE_NAME, SESSION_DURATION_SECONDS, createSessionToken } from '../../lib/auth';

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_API = 'https://api.github.com';

/** Check if login is in repo contributors (paginated). Uses GITHUB_TOKEN or GITHUB_REPO_ACCESS_TOKEN. */
async function isRepoContributor(owner: string, repo: string, login: string, repoToken: string): Promise<boolean> {
	for (let page = 1; ; page++) {
		const url = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=100&page=${page}`;
		const res = await fetch(url, {
			headers: {
				Accept: 'application/vnd.github+json',
				Authorization: `Bearer ${repoToken}`,
			},
		});
		if (!res.ok) return false;
		const list = (await res.json()) as Array<{ login?: string }>;
		if (list.length === 0) break;
		for (const c of list) {
			if (c.login === login) return true;
		}
		if (list.length < 100) break;
	}
	return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
	if (req.method !== 'GET') {
		res.setHeader('Allow', 'GET');
		res.status(405).send('Method Not Allowed');
		return;
	}

	const code = typeof req.query.code === 'string' ? req.query.code : null;
	const error = typeof req.query.error === 'string' ? req.query.error : null;

	if (error) {
		res.redirect(302, `/?error=${encodeURIComponent(error)}`);
		return;
	}

	if (!code) {
		res.status(400).send('Missing code');
		return;
	}

	const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
	const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		res.status(500).send('GitHub OAuth is not configured');
		return;
	}

	const baseUrl = process.env.VERCEL_URL
		? `https://${process.env.VERCEL_URL}`
		: process.env.URL || 'http://localhost:3000';
	const callbackUrl =
		process.env.GITHUB_OAUTH_REDIRECT_URI ||
		`${baseUrl.replace(/\/$/, '')}/api/auth/callback`;

	const tokenRes = await fetch(GITHUB_TOKEN_URL, {
		method: 'POST',
		headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code,
			redirect_uri: callbackUrl,
		}),
	});

	if (!tokenRes.ok) {
		res.status(502).send('GitHub token exchange failed');
		return;
	}

	const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
	if (tokenData.error || !tokenData.access_token) {
		res.redirect(302, `/?error=${encodeURIComponent(tokenData.error || 'no_access_token')}`);
		return;
	}

	const userRes = await fetch(GITHUB_USER_URL, {
		headers: { Authorization: `Bearer ${tokenData.access_token}` },
	});
	if (!userRes.ok) {
		res.status(502).send('Failed to fetch GitHub user');
		return;
	}

	const user = (await userRes.json()) as { id: number; login?: string };
	const login = typeof user.login === 'string' ? user.login : 'unknown';
	const githubId = String(user.id);

	const repoOwner = process.env.GITHUB_REPO_OWNER;
	const repoName = process.env.GITHUB_REPO_NAME;
	const repoToken = process.env.GITHUB_REPO_ACCESS_TOKEN || process.env.GITHUB_TOKEN;
	if (repoOwner && repoName && repoToken) {
		const isOwner = login.toLowerCase() === repoOwner.toLowerCase();
		const isContributor = isOwner || (await isRepoContributor(repoOwner, repoName, login, repoToken));
		if (!isContributor) {
			res.redirect(302, `/api/auth/error?error=${encodeURIComponent('access_denied')}`);
			return;
		}
	}

	let token: string;
	try {
		token = await createSessionToken(login, githubId);
	} catch (err) {
		res.status(500).send('AUTH_SECRET is not configured or invalid');
		return;
	}

	res.setHeader(
		'Set-Cookie',
		`${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}`,
	);
	res.redirect(302, '/');
}
