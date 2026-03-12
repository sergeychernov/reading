import { NextResponse } from 'next/server';
import { getDb, getAllBooksAdmin, serializeBook } from '@reading/data';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
	try {
		const db = await getDb();
		const docs = await getAllBooksAdmin(db);
		const books = docs.map(serializeBook);
		return NextResponse.json(books);
	} catch (error) {
		console.error('Failed to fetch books:', error);
		return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
	}
}
