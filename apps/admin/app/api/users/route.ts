import { NextResponse } from 'next/server';
import { getAllUsers } from '../../../lib/db/users';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
	try {
		const users = await getAllUsers();
		return NextResponse.json(users);
	} catch (error) {
		console.error('Failed to fetch users:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch users' },
			{ status: 500 },
		);
	}
}
