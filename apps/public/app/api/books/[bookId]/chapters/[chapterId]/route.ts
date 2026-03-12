import { NextResponse } from 'next/server';
import { getDb, getChapterById } from '@reading/data';

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ bookId: string; chapterId: string }> },
): Promise<NextResponse> {
	const { chapterId } = await params;

	try {
		const db = await getDb();
		const chapter = await getChapterById(db, chapterId);
		if (!chapter) {
			return NextResponse.json(
				{ error: 'Chapter not found' },
				{ status: 404 },
			);
		}
		return NextResponse.json(chapter);
	} catch (error) {
		console.error('Failed to fetch chapter:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch chapter' },
			{ status: 500 },
		);
	}
}
