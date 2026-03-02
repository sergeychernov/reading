/**
 * Clears session cookie and redirects to home (which will redirect to login).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { COOKIE_NAME } from '../../lib/auth';

export default function handler(_req: VercelRequest, res: VercelResponse): void {
	res.setHeader(
		'Set-Cookie',
		`${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
	);
	res.redirect(302, '/');
}
