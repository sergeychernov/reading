import type { ObjectId } from 'mongodb';

export type SubscriptionPlan = 'free' | 'pro';

/** ISO 639-1 language code for word meanings and translations. */
export type TranslationLanguage =
	| 'en'  // English
	| 'ru'  // Russian
	| 'de'  // German
	| 'fr'  // French
	| 'es'  // Spanish
	| 'it'  // Italian
	| 'pt'  // Portuguese
	| 'pl'  // Polish
	| 'nl'  // Dutch
	| 'sv'  // Swedish
	| 'no'  // Norwegian
	| 'da'  // Danish
	| 'fi'  // Finnish
	| 'cs'  // Czech
	| 'ro'  // Romanian
	| 'uk'  // Ukrainian
	| 'sr'; // Serbian

export interface TranslationLanguageOption {
	value: TranslationLanguage;
	label: string;
}

export const TRANSLATION_LANGUAGE_OPTIONS: TranslationLanguageOption[] = [
	{ value: 'en', label: 'English' },
	{ value: 'ru', label: 'Russian' },
	{ value: 'de', label: 'German' },
	{ value: 'fr', label: 'French' },
	{ value: 'es', label: 'Spanish' },
	{ value: 'it', label: 'Italian' },
	{ value: 'pt', label: 'Portuguese' },
	{ value: 'pl', label: 'Polish' },
	{ value: 'nl', label: 'Dutch' },
	{ value: 'sv', label: 'Swedish' },
	{ value: 'no', label: 'Norwegian' },
	{ value: 'da', label: 'Danish' },
	{ value: 'fi', label: 'Finnish' },
	{ value: 'cs', label: 'Czech' },
	{ value: 'ro', label: 'Romanian' },
	{ value: 'uk', label: 'Ukrainian' },
	{ value: 'sr', label: 'Srpski' },
];

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
	/** Language used for word meanings and translations. */
	translationLanguage?: TranslationLanguage;
}
