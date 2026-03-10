import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

const authDisabled = process.env.AUTH_DISABLED === 'true';

/**
 * Edge-compatible auth config (no Node.js-only imports).
 * Used by middleware.
 */
export const authConfig = {
	session: { strategy: 'jwt' as const },
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
			const { pathname } = request.nextUrl;
			const isProtected =
				pathname.startsWith('/upload') ||
				pathname.startsWith('/profile') ||
				pathname.startsWith('/api/profile') ||
				(pathname === '/api/books' && request.method === 'POST');

			if (isProtected && !isAuthenticated) {
				return false;
			}

			return true;
		},
	},
} satisfies NextAuthConfig;
