import type { BlobStorage } from './types';
import { VercelBlobStorage } from './vercel';
import { LocalBlobStorage } from './local';

export type { BlobStorage } from './types';

let instance: BlobStorage | null = null;

export function getBlobStorage(): BlobStorage {
	if (!instance) {
		instance = process.env.BLOB_READ_WRITE_TOKEN
			? new VercelBlobStorage()
			: new LocalBlobStorage();
	}
	return instance;
}

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
	await getBlobStorage().put(epubBlobKey(bookId), fileBuffer, 'application/epub+zip');
}

export async function uploadBookFile(
	bookId: string,
	filePath: string,
	content: Buffer | string,
	contentType: string,
): Promise<void> {
	await getBlobStorage().put(bookFileKey(bookId, filePath), content, contentType);
}

// ── Download ───────────────────────────────────────────────────────

export async function downloadBlob(key: string): Promise<Buffer> {
	return getBlobStorage().get(key);
}

export async function downloadEpub(key: string): Promise<Buffer> {
	return downloadBlob(key);
}

// ── Delete ─────────────────────────────────────────────────────────

export async function deleteBlob(key: string): Promise<void> {
	await getBlobStorage().remove(key);
}

/**
 * Deletes generated parsing artifacts for a book:
 * - books/{bookId}/metadata.json
 * - books/{bookId}/chapters/*
 * - books/{bookId}/cover.*
 * Preserves the source EPUB file.
 */
export async function deleteBookProcessingArtifacts(bookId: string): Promise<void> {
	const storage = getBlobStorage();
	const allKeys = await storage.list(bookFileKey(bookId, ''));
	const artifactKeys = allKeys.filter((k) =>
		k.includes('metadata.json')
		|| k.includes('chapters/')
		|| k.includes('cover.'),
	);

	await Promise.all(artifactKeys.map((k) => storage.remove(k)));
}
