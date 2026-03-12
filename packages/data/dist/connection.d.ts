import { MongoClient, type Db } from 'mongodb';
export declare const DB_NAME = "reading";
/**
 * Returns a cached MongoClient promise (Next.js-friendly).
 * Useful when a raw client is required, e.g. for NextAuth MongoDBAdapter.
 */
export declare function getClientPromise(): Promise<MongoClient>;
/**
 * Returns a cached Db instance (Next.js-friendly).
 * Re-uses a single MongoClient stored on globalThis so hot-reload
 * in development does not leak connections.
 */
export declare function getDb(): Promise<Db>;
/**
 * Opens a throwaway connection, passes the Db to `fn`, then closes.
 * Use in pipeline jobs or scripts where a long-lived client is not desired.
 */
export declare function withDb<T>(fn: (db: Db) => Promise<T>): Promise<T>;
