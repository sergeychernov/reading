import { resolve } from 'node:path';
import { createStorage } from 'unstorage';
import fsDriver from 'unstorage/drivers/fs';
import vercelBlobDriver from 'unstorage/drivers/vercel-blob';

// ── Storage instance ───────────────────────────────────────────────

const vercelDriver = () =>
	// @ts-expect-error unstorage 1.x types restrict access to "public" but the driver supports "private" at runtime
	vercelBlobDriver({ access: 'private' });

const storage = process.env.BLOB_READ_WRITE_TOKEN
	? createStorage({ driver: vercelDriver() })
	: createStorage({ driver: fsDriver({ base: resolve(process.cwd(), '.blob') }) });

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
	await storage.setItemRaw(epubBlobKey(bookId), fileBuffer);
}

export async function uploadBookFile(
	bookId: string,
	filePath: string,
	content: Buffer | string,
	contentType: string,
): Promise<void> {
	await storage.setItemRaw(bookFileKey(bookId, filePath), content);
}

// ── Download ───────────────────────────────────────────────────────

/**
 * Downloads a blob by key. Works with both Vercel Blob (production)
 * and local filesystem (development) via unstorage driver switching.
 */
export async function downloadBlob(key: string): Promise<Buffer> {
	const raw = await storage.getItemRaw(key);
	if (raw === null || raw === undefined) {
		throw new Error(`Blob not found for key: ${key}`);
	}
	return toBuffer(raw);
}

export async function downloadEpub(key: string): Promise<Buffer> {
	return downloadBlob(key);
}

// ── Delete ─────────────────────────────────────────────────────────

export async function deleteBlob(key: string): Promise<void> {
	await storage.removeItem(key);
}

/**
 * Deletes generated parsing artifacts for a book:
 * - books/{bookId}/metadata.json
 * - books/{bookId}/chapters/*
 * Preserves the source EPUB file.
 */
export async function deleteBookProcessingArtifacts(bookId: string): Promise<void> {
	const allKeys = await storage.getKeys(bookFileKey(bookId, ''));
	const artifactKeys = allKeys.filter((k) => {
		const normalized = k.replace(/:/g, '/');
		return normalized.includes('metadata.json')
			|| normalized.includes('chapters/')
			|| normalized.includes('cover.');
	});

	await Promise.all(artifactKeys.map((k) => storage.removeItem(k)));
}

// ── Internal helpers ───────────────────────────────────────────────

function toBuffer(data: unknown): Buffer {
	if (Buffer.isBuffer(data)) return data;
	if (data instanceof ArrayBuffer) return Buffer.from(data);
	if (data instanceof Uint8Array) {
		return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
	}
	if (typeof data === 'string') return Buffer.from(data, 'utf-8');
	throw new Error(`Cannot convert ${typeof data} to Buffer`);
}
