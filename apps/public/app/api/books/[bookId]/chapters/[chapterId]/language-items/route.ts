import { NextResponse } from 'next/server';
import { getLanguageItemsByChapter } from '../../../../../../../lib/db/language-items';
import type { LanguageItemCategory } from '../../../../../../../lib/types/processing';

const VALID_CATEGORIES = new Set<LanguageItemCategory>(['idiom', 'phrasal_verb', 'rare_word']);

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ bookId: string; chapterId: string }> },
): Promise<NextResponse> {
	const { chapterId } = await params;
	const { searchParams } = new URL(request.url);
	const category = searchParams.get('category') as LanguageItemCategory | null;

	if (category && !VALID_CATEGORIES.has(category)) {
		return NextResponse.json(
			{ error: 'Invalid category. Must be one of: idiom, phrasal_verb, rare_word' },
			{ status: 400 },
		);
	}

	try {
		const items = await getLanguageItemsByChapter(
			chapterId,
			category ?? undefined,
		);
		return NextResponse.json(items);
	} catch (error) {
		console.error('Failed to fetch language items:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch language items' },
			{ status: 500 },
		);
	}
}
