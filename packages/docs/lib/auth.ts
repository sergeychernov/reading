/**
 * Shared auth helpers: JWT sign/verify for session cookie.
 * Used by Edge middleware and API routes; must stay Edge-compatible (no Node APIs).
 * Uses dynamic import('jose') so the file can be compiled as CommonJS on Vercel (jose is ESM-only).
 */
const COOKIE_NAME = 'gh_docs_session';
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

export { COOKIE_NAME, SESSION_DURATION_SECONDS };

export interface SessionPayload {
	sub: string;
	login: string;
	exp: number;
	iat: number;
}

function getSecret(): Uint8Array {
	const secret = process.env.AUTH_SECRET;
	if (!secret || secret.length < 32) {
		throw new Error('AUTH_SECRET must be set and at least 32 characters');
	}
	return new TextEncoder().encode(secret);
}

export async function createSessionToken(login: string, githubId: string): Promise<string> {
	const { SignJWT } = await import('jose');
	const secret = getSecret();
	const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
	return new SignJWT({ login, sub: githubId })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(exp)
		.sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
	try {
		const { jwtVerify } = await import('jose');
		const secret = getSecret();
		const { payload } = await jwtVerify(token, secret);
		if (
			typeof payload.sub !== 'string' ||
			typeof payload.login !== 'string' ||
			typeof payload.exp !== 'number'
		) {
			return null;
		}
		return {
			sub: payload.sub,
			login: payload.login,
			exp: payload.exp,
			iat: typeof payload.iat === 'number' ? payload.iat : 0,
		};
	} catch {
		return null;
	}
}

function getCookie(request: Request, name: string): string | null {
	const cookieHeader = request.headers.get('cookie');
	if (!cookieHeader) return null;
	const match = cookieHeader.match(new RegExp(`(^|\\s)${name}=([^;]+)`));
	return match ? decodeURIComponent(match[2].trim()) : null;
}

export function getSessionCookie(request: Request): string | null {
	return getCookie(request, COOKIE_NAME);
}
