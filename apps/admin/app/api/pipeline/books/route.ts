import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

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
		const docs = await db
			.collection('books')
			.find(
				{},
				{
					projection: {
						_id: 1,
						title: 1,
						author: 1,
						processingStatus: 1,
						chapterCount: 1,
						createdAt: 1,
					},
					sort: { createdAt: -1 },
					limit: 50,
				},
			)
			.toArray();

		const books: BookListItem[] = docs.map((doc) => ({
			id: (doc._id as { toHexString(): string }).toHexString(),
			title: (doc.title as string | null) ?? null,
			author: (doc.author as string | null) ?? null,
			processingStatus: (doc.processingStatus as string) ?? 'unknown',
			chapterCount: (doc.chapterCount as number) ?? 0,
			createdAt: doc.createdAt instanceof Date
				? doc.createdAt.toISOString()
				: String(doc.createdAt ?? ''),
		}));

		return NextResponse.json(books);
	} catch (error) {
		console.error('Failed to fetch books:', error);
		return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
	}
}
