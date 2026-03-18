import { mkdir, readFile, writeFile, unlink, readdir, stat } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import type { BlobStorage } from './types';

export class LocalBlobStorage implements BlobStorage {
	private readonly baseDir: string;

	constructor(baseDir?: string) {
		this.baseDir = baseDir ?? resolve(process.cwd(), '.blob');
	}

	async put(key: string, data: Buffer | string, _contentType: string): Promise<void> {
		const filePath = this.keyToPath(key);
		await mkdir(dirname(filePath), { recursive: true });
		await writeFile(filePath, data);
	}

	async get(key: string): Promise<Buffer> {
		const filePath = this.keyToPath(key);
		try {
			return await readFile(filePath);
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
				throw new Error(`Blob not found for key: ${key}`);
			}
			throw err;
		}
	}

	async remove(key: string): Promise<void> {
		const filePath = this.keyToPath(key);
		try {
			await unlink(filePath);
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
				throw err;
			}
		}
	}

	async list(prefix: string): Promise<string[]> {
		const dir = this.keyToPath(prefix);
		return this.walk(dir, prefix);
	}

	private keyToPath(key: string): string {
		return resolve(this.baseDir, key);
	}

	private async walk(dir: string, prefix: string): Promise<string[]> {
		let entries;
		try {
			entries = await readdir(dir, { withFileTypes: true });
		} catch {
			return [];
		}

		const keys: string[] = [];
		for (const entry of entries) {
			const fullPath = join(dir, entry.name);
			if (entry.isDirectory()) {
				const subKeys = await this.walk(fullPath, `${prefix}${entry.name}/`);
				keys.push(...subKeys);
			} else {
				keys.push(`${prefix}${entry.name}`);
			}
		}
		return keys;
	}
}
