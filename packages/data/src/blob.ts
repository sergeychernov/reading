import { put, del } from '@vercel/blob';

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
 * Downloads an EPUB from private Vercel Blob storage using Bearer auth.
 * Requires `BLOB_READ_WRITE_TOKEN` in the environment.
 */
export async function downloadEpub(url: string): Promise<Buffer> {
	const token = process.env.BLOB_READ_WRITE_TOKEN;
	if (!token) {
		throw new Error('BLOB_READ_WRITE_TOKEN is not set');
	}

	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch EPUB: ${response.status} ${response.statusText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
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

export async function deleteBlob(url: string): Promise<void> {
	await del(url);
}
