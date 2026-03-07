import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

const authDisabled = process.env.AUTH_DISABLED === 'true';

/**
 * Edge-compatible auth config (no Node.js-only imports).
 * Used by middleware.
 */
export const authConfig = {
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],
	callbacks: {
		authorized({ auth, request }) {
			if (authDisabled) return true;

			const isAuthenticated = !!auth?.user;
			const isProtected = request.nextUrl.pathname.startsWith('/upload')
				|| (request.nextUrl.pathname === '/api/books' && request.method === 'POST');

			if (isProtected && !isAuthenticated) {
				return false;
			}

			return true;
		},
	},
} satisfies NextAuthConfig;
