import { Readable } from 'node:stream';
import { put, del, get, list } from '@vercel/blob';

// ── Key helpers ────────────────────────────────────────────────────

export function epubBlobKey(bookId: string): string {
	return `books/${bookId}/src.epub`;
}

export function bookFileKey(bookId: string, filePath: string): string {
	return `books/${bookId}/${filePath}`;
}

// ── Upload ─────────────────────────────────────────────────────────

export async function uploadEpub(
	bookId: string,
	fileBuffer: Buffer,
): Promise<void> {
	await put(epubBlobKey(bookId), fileBuffer, {
		access: 'private',
		contentType: 'application/epub+zip',
		addRandomSuffix: false,
	});
}

export async function uploadBookFile(
	bookId: string,
	filePath: string,
	content: Buffer | string,
	contentType: string,
): Promise<void> {
	await put(bookFileKey(bookId, filePath), content, {
		access: 'private',
		contentType,
		addRandomSuffix: false,
	});
}

// ── Download ───────────────────────────────────────────────────────

/**
 * Resolves a blob key to its full URL via the list API,
 * then downloads the content. Requires `BLOB_READ_WRITE_TOKEN`.
 */
export async function downloadBlob(key: string): Promise<Buffer> {
	const rawToken = process.env.BLOB_READ_WRITE_TOKEN;
	if (!rawToken) {
		throw new Error('BLOB_READ_WRITE_TOKEN is not set');
	}
	const token = rawToken.trim();

	const url = await resolveKeyToUrl(key);

	let result: Awaited<ReturnType<typeof get>>;
	try {
		result = await get(url, { access: 'private', token });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		if (message.includes('403') || message.includes('Forbidden')) {
			throw new Error(
				`Vercel Blob 403: token may be for a different store. key: ${key}. ` +
					'Ensure BLOB_READ_WRITE_TOKEN is from the same Vercel Blob store that uploaded this file.',
			);
		}
		throw err;
	}

	if (result === null) {
		throw new Error(`Blob not found for key: ${key}`);
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

export async function downloadEpub(key: string): Promise<Buffer> {
	return downloadBlob(key);
}

// ── Delete ─────────────────────────────────────────────────────────

export async function deleteBlob(key: string): Promise<void> {
	const urls = await listBlobUrlsByPrefix(key);
	if (urls.length > 0) {
		await del(urls);
	}
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

// ── Internal helpers ───────────────────────────────────────────────

async function resolveKeyToUrl(key: string): Promise<string> {
	const page = await list({ prefix: key, limit: 1 });
	if (page.blobs.length === 0) {
		throw new Error(`Blob not found for key: ${key}`);
	}
	return page.blobs[0].url;
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
