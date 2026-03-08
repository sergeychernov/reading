import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { getAllBooks } from '../../../lib/db/books';
import { uploadAndCreateBook } from '../../../lib/processing/pipeline';
import { validateEpubFile } from '../../../lib/validation/upload';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
	try {
		const books = await getAllBooks();
		return NextResponse.json(books);
	} catch (error) {
		console.error('Failed to fetch books:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch books' },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request): Promise<NextResponse> {
	const authDisabled = process.env.AUTH_DISABLED === 'true';
	if (!authDisabled) {
		const session = await auth();
		if (!session?.user) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 },
			);
		}
	}

	try {
		const formData = await request.formData();
		const file = formData.get('epub') as File | null;
		const audibleUrl = (formData.get('audibleUrl') as string) || null;
		const kindleUrl = (formData.get('kindleUrl') as string) || null;

		if (!file) {
			return NextResponse.json(
				{ error: 'No EPUB file provided' },
				{ status: 400 },
			);
		}

		const validation = validateEpubFile(file);
		if (!validation.valid) {
			return NextResponse.json(
				{ error: validation.error },
				{ status: 400 },
			);
		}

		const buffer = Buffer.from(await file.arrayBuffer());

		const result = await uploadAndCreateBook({
			fileBuffer: buffer,
			fileName: file.name,
			audibleUrl,
			kindleUrl,
		});

		// Fire-and-forget: trigger pipeline processing via NestJS pipeline API
		const pipelineUrl = process.env.PIPELINE_API_URL ?? 'http://localhost:3001';
		const pipelineSecret = process.env.PIPELINE_API_SECRET;
		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (pipelineSecret) headers['x-internal-secret'] = pipelineSecret;

		fetch(`${pipelineUrl}/api/v1/book-processing`, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				bookId: result.bookId,
				epubBlobUrl: result.epubBlobUrl,
			}),
		}).catch((err) => {
			console.error(`Failed to trigger pipeline for book ${result.bookId}:`, err);
		});

		return NextResponse.json(
			{ bookId: result.bookId, status: 'parsing' },
			{ status: 201 },
		);
	} catch (error) {
		console.error('Failed to upload book:', error);
		return NextResponse.json(
			{ error: 'Failed to upload book' },
			{ status: 500 },
		);
	}
}
