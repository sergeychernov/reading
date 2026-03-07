import { put, del } from '@vercel/blob';

export async function uploadEpub(
	filename: string,
	fileBuffer: Buffer,
): Promise<string> {
	const blob = await put(`epubs/${filename}`, fileBuffer, {
		access: 'private',
		contentType: 'application/epub+zip',
	});
	return blob.url;
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
