import { NextResponse } from 'next/server';

export function GET(): NextResponse {
	return new NextResponse('Logged out', {
		status: 401,
		headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
	});
}
