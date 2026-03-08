import { NextResponse } from 'next/server';
import { auth } from '../../auth';
import { getUserByEmail } from '../db/users';

const authDisabled = process.env.AUTH_DISABLED === 'true';

export interface AuthResult {
	userId: string;
	email: string;
}

/**
 * Checks that the request comes from an authenticated user with an active
 * subscription (plan === 'pro'). Returns a NextResponse error when the
 * check fails, or {@link AuthResult} on success.
 *
 * When `AUTH_DISABLED` is set the check is skipped entirely.
 */
export async function requireSubscription(): Promise<AuthResult | NextResponse> {
	if (authDisabled) {
		return { userId: 'dev', email: 'dev@localhost' };
	}

	const session = await auth();
	if (!session?.user?.email) {
		return NextResponse.json(
			{ error: 'Authentication required' },
			{ status: 401 },
		);
	}

	const user = await getUserByEmail(session.user.email);
	const plan = user?.subscription ?? 'free';

	if (plan !== 'pro') {
		return NextResponse.json(
			{ error: 'Active subscription required' },
			{ status: 403 },
		);
	}

	return {
		userId: user!._id.toHexString(),
		email: session.user.email,
	};
}
