import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateUserSubscription } from '../../../../lib/db/users';

export const runtime = 'nodejs';

const updateSchema = z.object({
	subscription: z.enum(['free', 'pro']),
});

interface RouteParams {
	params: Promise<{ userId: string }>;
}

export async function PUT(request: Request, { params }: RouteParams): Promise<NextResponse> {
	const { userId } = await params;

	try {
		const body: unknown = await request.json();
		const { subscription } = updateSchema.parse(body);
		const found = await updateUserSubscription(userId, subscription);

		if (!found) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		return NextResponse.json({ userId, subscription });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: error.flatten() }, { status: 422 });
		}
		console.error('Failed to update user:', error);
		return NextResponse.json(
			{ error: 'Failed to update user' },
			{ status: 500 },
		);
	}
}
