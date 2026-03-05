import { NextResponse } from 'next/server';
import { getBookById } from '../../../../lib/db/books';

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ bookId: string }> },
): Promise<NextResponse> {
	const { bookId } = await params;

	try {
		const book = await getBookById(bookId);
		if (!book) {
			return NextResponse.json(
				{ error: 'Book not found' },
				{ status: 404 },
			);
		}
		return NextResponse.json(book);
	} catch (error) {
		console.error('Failed to fetch book:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch book' },
			{ status: 500 },
		);
	}
}
