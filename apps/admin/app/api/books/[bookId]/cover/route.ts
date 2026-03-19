import { NextResponse } from 'next/server';
import { downloadBlob, bookFileKey } from '@reading/data';

export const runtime = 'nodejs';

interface RouteParams {
	params: Promise<{ bookId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
	const { bookId } = await params;

	const extensions = ['jpg', 'png', 'webp', 'gif'];
	const mediaTypes: Record<string, string> = {
		jpg: 'image/jpeg',
		png: 'image/png',
		webp: 'image/webp',
		gif: 'image/gif',
	};

	for (const ext of extensions) {
		const key = bookFileKey(bookId, `cover.${ext}`);
		try {
			const buffer = await downloadBlob(key);
			return new NextResponse(buffer.buffer as ArrayBuffer, {
				headers: {
					'Content-Type': mediaTypes[ext] ?? 'image/jpeg',
					'Cache-Control': 'public, max-age=31536000, immutable',
				},
			});
		} catch {
			// Try next extension
		}
	}

	return NextResponse.json({ error: 'Cover not found' }, { status: 404 });
}
