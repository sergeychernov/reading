import { z } from 'zod';

export const meaningTranslationsSchema = z.object({
	en: z.string().describe('Simple English explanation'),
	ru: z.string().describe('Russian translation'),
}).describe('Meaning/translation in each supported language');

export const languageItemBaseSchema = z.object({
	term: z.string().describe('The idiom, phrasal verb, or rare word'),
	exampleFromBook: z.string().describe('The exact sentence from the book containing this term'),
});

export const idiomItemSchema = z.object({
	term: z.string().describe('The idiomatic expression in canonical form (e.g. "break the ice", "once in a blue moon")'),
	exampleFromBook: z.string().describe('The exact sentence from the book containing this idiom'),
});

export const phrasalVerbItemSchema = z.object({
	term: z.string().describe('Canonical phrasal verb in base infinitive form: verb + allowed particle only (about, across, after, along, around, aside, away, back, by, down, for, forward, in, off, on, out, over, round, through, together, under, up). Exclude verb + to patterns (e.g. "screech to a halt"), verb + noun collocations (e.g. "cut costs"), and verb + possessive pronoun + noun patterns (e.g. "clear his throat"). Examples: "give up", "run into", "run out".'),
	exampleFromBook: z.string().describe('The exact sentence from the book containing this phrasal verb'),
});

export const partOfSpeechSchema = z.enum([
	'noun',
	'verb',
	'adjective',
	'adverb',
	'preposition',
	'conjunction',
	'interjection',
]).describe('Part of speech of the word');

export const rareWordItemSchema = z.object({
	term: z.string().describe('The uncommon single word in base dictionary form (e.g. "wither", "ephemeral")'),
	partOfSpeech: partOfSpeechSchema,
	exampleFromBook: z.string().describe('The exact sentence from the book containing this word'),
});

export const rarityScoreSchema = z.number().int().min(0).max(10).describe(
		'Rarity score 0–10: 0 = extremely common (e.g. "the"), 10 = very rare / obscure',
);

export const languageItemScoredSchema = languageItemBaseSchema.extend({
	rarity: rarityScoreSchema,
});

export const languageItemSchema = languageItemScoredSchema.extend({
	meaning: meaningTranslationsSchema,
});

export const chapterExtractionSchema = z.object({
	summary: z.string().describe('Brief chapter summary in simple English, 3-5 sentences'),
	idioms: z.array(languageItemSchema).describe('Idiomatic expressions found in the chapter'),
	phrasalVerbs: z.array(languageItemSchema).describe('Phrasal verbs found in the chapter'),
	rareWords: z.array(languageItemSchema).describe('Uncommon vocabulary for B1-B2 learners'),
});

export type PartOfSpeech = z.infer<typeof partOfSpeechSchema>;
export type RareWordItem = z.infer<typeof rareWordItemSchema>;
export type MeaningTranslations = z.infer<typeof meaningTranslationsSchema>;
export type ChapterExtraction = z.infer<typeof chapterExtractionSchema>;
export type LanguageItemBase = z.infer<typeof languageItemBaseSchema>;
export type LanguageItemScored = z.infer<typeof languageItemScoredSchema>;
export type LanguageItemExtracted = z.infer<typeof languageItemSchema>;
