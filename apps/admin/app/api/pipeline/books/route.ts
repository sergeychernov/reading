import { NextResponse } from 'next/server';
import { getDb, getAllBooksAdmin, serializeBook } from '@reading/data';

export const runtime = 'nodejs';

export interface BookListItem {
	id: string;
	title: string | null;
	author: string | null;
	processingStatus: string;
	chapterCount: number;
	createdAt: string;
}

export async function GET(): Promise<NextResponse> {
	try {
		const db = await getDb();
		const docs = await getAllBooksAdmin(db);
		const serialized = docs.slice(0, 50).map(serializeBook);

		const books: BookListItem[] = serialized.map((b) => ({
			id: b._id,
			title: b.title || null,
			author: b.author || null,
			processingStatus: b.processingStatus,
			chapterCount: b.chapterCount,
			createdAt: b.createdAt,
		}));

		return NextResponse.json(books);
	} catch (error) {
		console.error('Failed to fetch books:', error);
		return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
	}
}
