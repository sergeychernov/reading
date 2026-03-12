import { MongoClient, type Db } from 'mongodb';

export const DB_NAME = 'reading';

// ── Next.js-friendly cached connection ──────────────────────────────

interface MongoGlobal {
	_mongoClientPromise?: Promise<MongoClient>;
}

const globalWithMongo = globalThis as typeof globalThis & MongoGlobal;

let cachedUri: string | undefined;

function ensureCachedClient(): Promise<MongoClient> {
	const uri = process.env.MONGODB_URI;
	if (!uri) {
		throw new Error('MONGODB_URI environment variable is not set');
	}

	if (cachedUri !== uri) {
		cachedUri = uri;
		delete globalWithMongo._mongoClientPromise;
	}

	if (!globalWithMongo._mongoClientPromise) {
		const client = new MongoClient(uri);
		globalWithMongo._mongoClientPromise = client.connect();
	}

	return globalWithMongo._mongoClientPromise;
}

/**
 * Returns a cached MongoClient promise (Next.js-friendly).
 * Useful when a raw client is required, e.g. for NextAuth MongoDBAdapter.
 */
export function getClientPromise(): Promise<MongoClient> {
	return ensureCachedClient();
}

/**
 * Returns a cached Db instance (Next.js-friendly).
 * Re-uses a single MongoClient stored on globalThis so hot-reload
 * in development does not leak connections.
 */
export async function getDb(): Promise<Db> {
	const client = await ensureCachedClient();
	return client.db(DB_NAME);
}

// ── Standalone connect-execute-close ────────────────────────────────

/**
 * Opens a throwaway connection, passes the Db to `fn`, then closes.
 * Use in pipeline jobs or scripts where a long-lived client is not desired.
 */
export async function withDb<T>(fn: (db: Db) => Promise<T>): Promise<T> {
	const uri = process.env.MONGODB_URI;
	if (!uri) {
		throw new Error('MONGODB_URI environment variable is not set');
	}

	const client = new MongoClient(uri);
	try {
		await client.connect();
		return await fn(client.db(DB_NAME));
	} finally {
		await client.close();
	}
}
