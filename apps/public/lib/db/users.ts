import { ObjectId } from 'mongodb';
import { getDb } from '../mongodb';
import type { SubscriptionPlan, UserDocument } from '../types/user';

const COLLECTION = 'users';

export async function getUserById(userId: string): Promise<UserDocument | null> {
	const db = await getDb();
	return db
		.collection<UserDocument>(COLLECTION)
		.findOne({ _id: new ObjectId(userId) });
}

export async function getUserByEmail(email: string): Promise<UserDocument | null> {
	const db = await getDb();
	return db.collection<UserDocument>(COLLECTION).findOne({ email });
}

export async function updateUserSubscription(
	userId: string,
	plan: SubscriptionPlan,
): Promise<void> {
	const db = await getDb();
	await db.collection(COLLECTION).updateOne(
		{ _id: new ObjectId(userId) },
		{ $set: { subscription: plan } },
	);
}

export async function getAllUsers(): Promise<UserDocument[]> {
	const db = await getDb();
	return db
		.collection<UserDocument>(COLLECTION)
		.find()
		.sort({ name: 1 })
		.toArray();
}
