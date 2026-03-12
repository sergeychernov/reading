import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb, getChaptersByBookId, serializeChapter } from '@reading/data';

export const runtime = 'nodejs';

interface RouteParams {
	params: Promise<{ bookId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
	const { bookId } = await params;

	if (!ObjectId.isValid(bookId)) {
		return NextResponse.json({ error: 'Invalid bookId' }, { status: 400 });
	}

	try {
		const db = await getDb();
		const docs = await getChaptersByBookId(db, bookId);
		const chapters = docs.map(serializeChapter);
		return NextResponse.json(chapters);
	} catch (error) {
		console.error('Failed to fetch chapters:', error);
		return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
	}
}
