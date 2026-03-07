import { NextResponse } from 'next/server';
import { getDb } from '../../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

const PIPELINE_API_URL = process.env.PIPELINE_API_URL ?? 'http://localhost:3001';

interface RouteParams {
	params: Promise<{ bookId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams): Promise<NextResponse> {
	const { bookId } = await params;

	if (!ObjectId.isValid(bookId)) {
		return NextResponse.json({ error: 'Invalid bookId' }, { status: 400 });
	}

	try {
		const db = await getDb();

		const chapters = await db
			.collection('chapters')
			.find(
				{ bookId: new ObjectId(bookId) },
				{
					projection: {
						_id: 1,
						chapterIndex: 1,
						title: 1,
						rawText: 1,
					},
				},
			)
			.toArray();

		if (chapters.length === 0) {
			return NextResponse.json(
				{ error: 'No chapters found for this book' },
				{ status: 404 },
			);
		}

		const url = `${PIPELINE_API_URL}/api/v1/chapter-extraction`;

		const results = await Promise.allSettled(
			chapters.map(async (chapter) => {
				const response = await fetch(url, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						bookId,
						chapterId: (chapter._id as { toHexString(): string }).toHexString(),
						chapterIndex: chapter.chapterIndex,
						chapterTitle: chapter.title,
						chapterText: chapter.rawText,
					}),
				});

				if (!response.ok) {
					const body = await response.text().catch(() => '');
					throw new Error(`HTTP ${response.status}: ${body}`);
				}

				return response.json();
			}),
		);

		let dispatched = 0;
		let errors = 0;
		const errorMessages: string[] = [];

		for (const result of results) {
			if (result.status === 'fulfilled') {
				dispatched++;
			} else {
				errors++;
				errorMessages.push(String(result.reason));
			}
		}

		return NextResponse.json({ dispatched, errors, errorMessages });
	} catch (error) {
		console.error('Failed to dispatch chapters:', error);
		return NextResponse.json({ error: 'Failed to dispatch chapters' }, { status: 500 });
	}
}
