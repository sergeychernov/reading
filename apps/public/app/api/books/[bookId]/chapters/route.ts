import { NextResponse } from 'next/server';
import { getDb, getChaptersByBookId } from '@reading/data';

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ bookId: string }> },
): Promise<NextResponse> {
	const { bookId } = await params;

	try {
		const db = await getDb();
		const chapters = await getChaptersByBookId(db, bookId);
		return NextResponse.json(chapters);
	} catch (error) {
		console.error('Failed to fetch chapters:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch chapters' },
			{ status: 500 },
		);
	}
}
