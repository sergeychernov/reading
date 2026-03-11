import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import type { AdminBook } from '../../../lib/types/book';

export const runtime = 'nodejs';

interface BookDoc {
	_id: { toHexString(): string };
	title?: string | null;
	author?: string | null;
	description?: string | null;
	coverImageUrl?: string | null;
	epubBlobUrl?: string | null;
	audibleUrl?: string | null;
	kindleUrl?: string | null;
	chapterCount?: number | null;
	processingStatus?: string | null;
	processingError?: string | null;
	createdAt?: Date | unknown;
	updatedAt?: Date | unknown;
}

function toIso(d: Date | unknown): string {
	if (d instanceof Date) return d.toISOString();
	return String(d ?? '');
}

export async function GET(): Promise<NextResponse> {
	try {
		const db = await getDb();
		const docs = await db
			.collection<BookDoc>('books')
			.find({})
			.sort({ createdAt: -1 })
			.toArray();

		const books: AdminBook[] = docs.map((doc) => ({
			_id: doc._id.toHexString(),
			title: doc.title ?? '',
			author: doc.author ?? '',
			description: doc.description ?? '',
			coverImageUrl: doc.coverImageUrl ?? null,
			epubBlobUrl: doc.epubBlobUrl ?? '',
			audibleUrl: doc.audibleUrl ?? null,
			kindleUrl: doc.kindleUrl ?? null,
			chapterCount: doc.chapterCount ?? 0,
			processingStatus: doc.processingStatus ?? 'unknown',
			processingError: doc.processingError ?? null,
			createdAt: toIso(doc.createdAt),
			updatedAt: toIso(doc.updatedAt),
		}));

		return NextResponse.json(books);
	} catch (error) {
		console.error('Failed to fetch books:', error);
		return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
	}
}
