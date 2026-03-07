import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest): NextResponse {
	const authHeader = request.headers.get('authorization');

	if (authHeader) {
		const [scheme, encoded] = authHeader.split(' ');
		if (scheme === 'Basic' && encoded) {
			const decoded = atob(encoded);
			const [login, ...rest] = decoded.split(':');
			const password = rest.join(':');

			const expectedLogin = process.env.ADMIN_USER ?? '';
			const expectedPassword = process.env.ADMIN_PASSWORD ?? '';

			if (login === expectedLogin && password === expectedPassword) {
				return NextResponse.next();
			}
		}
	}

	return new NextResponse('Unauthorized', {
		status: 401,
		headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
	});
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
