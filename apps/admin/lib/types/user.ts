export type SubscriptionPlan = 'free' | 'pro';

export interface UserDocument {
	_id: string;
	name: string | null;
	email: string;
	image: string | null;
	emailVerified: string | null;
	subscription: SubscriptionPlan;
}
