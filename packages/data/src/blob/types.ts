export interface BlobStorage {
	put(key: string, data: Buffer | string, contentType: string): Promise<void>;
	get(key: string): Promise<Buffer>;
	remove(key: string): Promise<void>;
	list(prefix: string): Promise<string[]>;
}
