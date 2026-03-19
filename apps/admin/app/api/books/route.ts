import { NextResponse } from 'next/server';
import { getDb, getAllBooksAdmin, serializeBook } from '@reading/data';
import { createUploadedBook, validateEpubFile } from '@reading/book-ingestion';

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

export async function POST(request: Request): Promise<NextResponse> {
	const requestStartedAt = Date.now();
	try {
		const formData = await request.formData();
		const file = formData.get('epub') as File | null;
		const audibleUrl = (formData.get('audibleUrl') as string) || null;
		const kindleUrl = (formData.get('kindleUrl') as string) || null;
		console.info(
			`[admin/api/books] POST received: hasFile=${Boolean(file)}, fileName="${file?.name ?? ''}", fileSize=${file?.size ?? 0}`,
		);

		const validation = validateEpubFile(file);
		if (!validation.valid) {
			return NextResponse.json(
				{ error: validation.error ?? 'Invalid file' },
				{ status: 400 },
			);
		}
		if (!file) {
			return NextResponse.json(
				{ error: 'No EPUB file provided' },
				{ status: 400 },
			);
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		console.info(
			`[admin/api/books] file buffered: bytes=${buffer.byteLength}, elapsedMs=${Date.now() - requestStartedAt}`,
		);
		const result = await createUploadedBook({
			fileBuffer: buffer,
			fileName: file.name,
			audibleUrl,
			kindleUrl,
		});
		console.info(
			`[admin/api/books] upload success: bookId=${result.bookId}, elapsedMs=${Date.now() - requestStartedAt}`,
		);

		return NextResponse.json(
			{ bookId: result.bookId, status: 'uploaded' },
			{ status: 201 },
		);
	} catch (error) {
		console.error(
			`[admin/api/books] upload failed after ${Date.now() - requestStartedAt}ms:`,
			error,
		);
		return NextResponse.json(
			{ error: 'Failed to upload book' },
			{ status: 500 },
		);
	}
}
