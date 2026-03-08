import type { ObjectId } from 'mongodb';

export type SubscriptionPlan = 'free' | 'pro';

/**
 * Extended user document — NextAuth creates the base fields (name, email,
 * image, emailVerified). We add subscription-related fields on top.
 */
export interface UserDocument {
	_id: ObjectId;
	name: string | null;
	email: string;
	image: string | null;
	emailVerified: Date | null;
	subscription: SubscriptionPlan;
}
