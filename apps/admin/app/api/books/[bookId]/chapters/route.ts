import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../lib/mongodb';
import type { AdminChapterListItem } from '../../../../../lib/types/book';

export const runtime = 'nodejs';

interface RouteParams {
	params: Promise<{ bookId: string }>;
}

interface ChapterDoc {
	_id: { toHexString(): string };
	chapterIndex?: number;
	title?: string | null;
	processingStatus?: string | null;
}

export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
	const { bookId } = await params;

	if (!ObjectId.isValid(bookId)) {
		return NextResponse.json({ error: 'Invalid bookId' }, { status: 400 });
	}

	try {
		const db = await getDb();
		const docs = await db
			.collection<ChapterDoc>('chapters')
			.find(
				{ bookId: new ObjectId(bookId) },
				{ projection: { _id: 1, chapterIndex: 1, title: 1, processingStatus: 1 } },
			)
			.sort({ chapterIndex: 1 })
			.toArray();

		const chapters: AdminChapterListItem[] = docs.map((doc) => ({
			_id: doc._id.toHexString(),
			chapterIndex: doc.chapterIndex ?? 0,
			title: doc.title ?? '',
			processingStatus: doc.processingStatus ?? 'unknown',
		}));

		return NextResponse.json(chapters);
	} catch (error) {
		console.error('Failed to fetch chapters:', error);
		return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
	}
}
