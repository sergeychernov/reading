import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
	throw new Error('MONGODB_URI environment variable is not set');
}

interface MongoGlobal {
	_mongoClientPromise?: Promise<MongoClient>;
}

const globalWithMongo = globalThis as typeof globalThis & MongoGlobal;

const client = new MongoClient(MONGODB_URI);

if (process.env.NODE_ENV === 'development') {
	if (!globalWithMongo._mongoClientPromise) {
		globalWithMongo._mongoClientPromise = client.connect();
	}
} else {
	globalWithMongo._mongoClientPromise = client.connect();
}

export const clientPromise: Promise<MongoClient> = globalWithMongo._mongoClientPromise;

export async function getDb() {
	const connectedClient = await clientPromise;
	return connectedClient.db('reading');
}
