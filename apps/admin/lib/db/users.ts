import { ObjectId } from 'mongodb';
import { getDb } from '@reading/data';
import type { SubscriptionPlan, UserDocument } from '../types/user';

const COLLECTION = 'users';

export async function getAllUsers(): Promise<UserDocument[]> {
	const db = await getDb();
	const docs = await db
		.collection(COLLECTION)
		.find()
		.sort({ name: 1 })
		.toArray();

	return docs.map((doc) => ({
		_id: doc._id.toHexString(),
		name: (doc.name as string) ?? null,
		email: doc.email as string,
		image: (doc.image as string) ?? null,
		emailVerified: doc.emailVerified ? String(doc.emailVerified) : null,
		subscription: (doc.subscription as SubscriptionPlan) ?? 'free',
	}));
}

export async function updateUserSubscription(
	userId: string,
	plan: SubscriptionPlan,
): Promise<boolean> {
	const db = await getDb();
	const result = await db.collection(COLLECTION).updateOne(
		{ _id: new ObjectId(userId) },
		{ $set: { subscription: plan } },
	);
	return result.matchedCount > 0;
}
