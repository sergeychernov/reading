import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const nextAuth = NextAuth(authConfig);

// Exported as a named function — Next.js 16 proxy convention requires
// either a default export or a named "proxy" export that is a function.
export const proxy = nextAuth.auth;

export const config = {
	matcher: [
		'/upload/:path*',
		'/api/books',
	],
};
