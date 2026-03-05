import { NextResponse } from 'next/server';
import { getChaptersByBookId } from '../../../../../lib/db/chapters';

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ bookId: string }> },
): Promise<NextResponse> {
	const { bookId } = await params;

	try {
		const chapters = await getChaptersByBookId(bookId);
		return NextResponse.json(chapters);
	} catch (error) {
		console.error('Failed to fetch chapters:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch chapters' },
			{ status: 500 },
		);
	}
}
