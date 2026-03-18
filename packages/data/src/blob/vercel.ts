import { Readable } from 'node:stream';
import { put, del, get, list } from '@vercel/blob';
import type { BlobStorage } from './types';

export class VercelBlobStorage implements BlobStorage {
	private readonly token: string;

	constructor() {
		const raw = process.env.BLOB_READ_WRITE_TOKEN;
		if (!raw) {
			throw new Error('BLOB_READ_WRITE_TOKEN is not set');
		}
		this.token = raw.trim();
	}

	async put(key: string, data: Buffer | string, contentType: string): Promise<void> {
		await put(key, data, {
			access: 'private',
			contentType,
			addRandomSuffix: false,
			token: this.token,
		});
	}

	async get(key: string): Promise<Buffer> {
		const url = await this.resolveUrl(key);

		let result: Awaited<ReturnType<typeof get>>;
		try {
			result = await get(url, { access: 'private', token: this.token });
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			if (message.includes('403') || message.includes('Forbidden')) {
				throw new Error(
					`Vercel Blob 403 for key "${key}". ` +
						'Ensure BLOB_READ_WRITE_TOKEN is from the same store that uploaded this file.',
				);
			}
			throw err;
		}

		if (result === null) {
			throw new Error(`Blob not found for key: ${key}`);
		}
		if (result.statusCode === 304 || result.stream === null) {
			throw new Error(`Blob not modified / no stream for key: ${key}`);
		}

		// @ts-expect-error Web ReadableStream works with Node Readable.fromWeb at runtime
		const nodeStream = Readable.fromWeb(result.stream);
		const chunks: Buffer[] = [];
		for await (const chunk of nodeStream) {
			chunks.push(Buffer.from(chunk));
		}
		return Buffer.concat(chunks);
	}

	async remove(key: string): Promise<void> {
		const urls = await this.listUrls(key);
		if (urls.length > 0) {
			await del(urls, { token: this.token });
		}
	}

	async list(prefix: string): Promise<string[]> {
		const keys: string[] = [];
		let cursor: string | undefined;

		do {
			const page = await list({ prefix, cursor, limit: 1000, token: this.token });
			for (const blob of page.blobs) {
				keys.push(blob.pathname);
			}
			cursor = page.hasMore ? page.cursor : undefined;
		} while (cursor);

		return keys;
	}

	private async resolveUrl(key: string): Promise<string> {
		const page = await list({ prefix: key, limit: 1, token: this.token });
		if (page.blobs.length === 0) {
			throw new Error(`Blob not found for key: ${key}`);
		}
		return page.blobs[0].url;
	}

	private async listUrls(prefix: string): Promise<string[]> {
		const urls: string[] = [];
		let cursor: string | undefined;

		do {
			const page = await list({ prefix, cursor, limit: 1000, token: this.token });
			for (const blob of page.blobs) {
				urls.push(blob.url);
			}
			cursor = page.hasMore ? page.cursor : undefined;
		} while (cursor);

		return urls;
	}
}
