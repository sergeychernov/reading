/**
 * Renders an error page for auth failures (e.g. access_denied for non-contributors).
 * Under /api/auth/ so middleware does not require a session — avoids redirect loops
 * when callback redirects here instead of to /.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const PAGE_TITLE = 'Access denied';
const ACCESS_DENIED_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${PAGE_TITLE}</title>
</head>
<body>
  <h1>${PAGE_TITLE}</h1>
  <p>You are not a contributor to this repository and cannot access the documentation.</p>
  <p><a href="/api/auth/login">Try again</a></p>
</body>
</html>`;

export default function handler(req: VercelRequest, res: VercelResponse): void {
	if (req.method !== 'GET') {
		res.setHeader('Allow', 'GET');
		res.status(405).send('Method Not Allowed');
		return;
	}

	const error = typeof req.query.error === 'string' ? req.query.error : '';
	if (error === 'access_denied') {
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.status(403).send(ACCESS_DENIED_HTML);
		return;
	}

	res.status(400).send('Bad Request');
}
