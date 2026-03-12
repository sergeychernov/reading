import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { getDb } from '@reading/data';
import type { TranslationLanguage } from '../../../lib/types/user';

export async function GET(): Promise<NextResponse> {
	const session = await auth();
	if (!session?.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = await getDb();
	const user = await db.collection('users').findOne(
		{ email: session.user.email },
		{ projection: { translationLanguage: 1 } },
	);

	return NextResponse.json({ translationLanguage: (user?.translationLanguage ?? null) as TranslationLanguage | null });
}

export async function PATCH(request: Request): Promise<NextResponse> {
	const session = await auth();
	if (!session?.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json() as { translationLanguage?: TranslationLanguage };
	const { translationLanguage } = body;

	if (!translationLanguage) {
		return NextResponse.json({ error: 'Invalid translationLanguage' }, { status: 400 });
	}

	const db = await getDb();
	await db.collection('users').updateOne(
		{ email: session.user.email },
		{ $set: { translationLanguage, updatedAt: new Date() } },
	);

	return NextResponse.json({ translationLanguage });
}
