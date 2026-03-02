/**
 * Vercel Edge Middleware: protect docs behind GitHub OAuth.
 * If no valid session cookie, redirect to /api/auth/login.
 */
import { getSessionCookie, verifySessionToken } from './lib/auth';

const PUBLIC_PREFIXES = ['/api/auth/'];

// Static assets: allow without auth so docs pages can load JS/CSS/fonts/images
const STATIC_EXTENSIONS = [
	'.js', '.css', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
	'.woff', '.woff2', '.ttf', '.eot', '.json', '.map',
];

export const config = {
	matcher: ['/((?!_next/static|_next/image).*)'],
};

function isAuthDisabled(): boolean {
	return process.env.DOCS_AUTH_DISABLED === 'true';
}

export default async function middleware(request: Request): Promise<Response | undefined> {
	if (isAuthDisabled()) return undefined;

	const url = new URL(request.url);
	const pathname = url.pathname;

	for (const prefix of PUBLIC_PREFIXES) {
		if (pathname.startsWith(prefix)) return undefined;
	}

	if (STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext)) || pathname.startsWith('/assets/')) {
		return undefined;
	}

	const token = getSessionCookie(request);
	if (!token) {
		return Response.redirect(new URL('/api/auth/login', request.url), 302);
	}

	const payload = await verifySessionToken(token);
	if (!payload) {
		return Response.redirect(new URL('/api/auth/login', request.url), 302);
	}

	return undefined;
}
