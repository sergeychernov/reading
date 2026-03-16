import { Readable } from 'node:stream';
import { put, del, get, list } from '@vercel/blob';

export async function uploadEpub(
	bookId: string,
	fileBuffer: Buffer,
): Promise<string> {
	const blob = await put(`books/${bookId}/src.epub`, fileBuffer, {
		access: 'private',
		contentType: 'application/epub+zip',
	});
	return blob.url;
}

/**
 * Downloads a file from private Vercel Blob storage via SDK.
 * Requires `BLOB_READ_WRITE_TOKEN` in the environment.
 */
export async function downloadBlob(url: string): Promise<Buffer> {
	const rawToken = process.env.BLOB_READ_WRITE_TOKEN;
	if (!rawToken) {
		throw new Error('BLOB_READ_WRITE_TOKEN is not set');
	}
	const token = rawToken.trim();

	let result: Awaited<ReturnType<typeof get>>;
	try {
		result = await get(url, { access: 'private', token });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		if (message.includes('403') || message.includes('Forbidden')) {
			const storeIdFromUrl = url.match(/^https:\/\/([^.]+)\.private\.blob\.vercel-storage\.com/)?.[1];
			throw new Error(
				`Vercel Blob 403: token may be for a different store. URL store id: ${storeIdFromUrl ?? 'unknown'}. ` +
					'Ensure BLOB_READ_WRITE_TOKEN is from the same Vercel Blob store that uploaded this file.',
			);
		}
		throw err;
	}

	if (result === null) {
		throw new Error('Blob not found');
	}
	if (result.statusCode === 304 || result.stream === null) {
		throw new Error('Blob not modified / no stream');
	}

	// @ts-expect-error Web ReadableStream works with Node Readable.fromWeb at runtime
	const nodeStream = Readable.fromWeb(result.stream);
	const chunks: Buffer[] = [];
	for await (const chunk of nodeStream) {
		chunks.push(Buffer.from(chunk));
	}
	return Buffer.concat(chunks);
}

/**
 * Downloads an EPUB from private Vercel Blob storage via SDK (correct auth for private blobs).
 * Requires `BLOB_READ_WRITE_TOKEN` in the environment.
 */
export async function downloadEpub(url: string): Promise<Buffer> {
	return downloadBlob(url);
}

export async function uploadCoverImage(
	bookId: string,
	imageBuffer: Buffer,
	contentType: string,
): Promise<string> {
	const blob = await put(`covers/${bookId}`, imageBuffer, {
		access: 'private',
		contentType,
	});
	return blob.url;
}

export async function uploadBookFile(
	bookId: string,
	filePath: string,
	content: Buffer | string,
	contentType: string,
): Promise<string> {
	const blob = await put(`books/${bookId}/${filePath}`, content, {
		access: 'private',
		contentType,
	});
	return blob.url;
}

export async function deleteBlob(url: string): Promise<void> {
	await del(url);
}

async function listBlobUrlsByPrefix(prefix: string): Promise<string[]> {
	const urls: string[] = [];
	let cursor: string | undefined;

	do {
		const page = await list({
			prefix,
			cursor,
			limit: 1000,
		});
		for (const blob of page.blobs) {
			urls.push(blob.url);
		}
		cursor = page.hasMore ? page.cursor : undefined;
	} while (cursor);

	return urls;
}

/**
 * Deletes generated parsing artifacts for a book:
 * - books/{bookId}/metadata.json
 * - books/{bookId}/chapters/*
 */
export async function deleteBookProcessingArtifacts(bookId: string): Promise<void> {
	const metadataUrls = await listBlobUrlsByPrefix(`books/${bookId}/metadata.json`);
	const chapterUrls = await listBlobUrlsByPrefix(`books/${bookId}/chapters/`);
	const urlsToDelete = [...metadataUrls, ...chapterUrls];

	if (urlsToDelete.length === 0) {
		return;
	}

	await del(urlsToDelete);
}
