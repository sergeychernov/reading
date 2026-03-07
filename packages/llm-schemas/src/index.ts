import { z } from 'zod';

export const languageItemSchema = z.object({
	term: z.string().describe('The idiom, phrasal verb, or rare word'),
	meaning: z.string().describe('Simple English meaning'),
	exampleFromBook: z.string().describe('The exact sentence from the book containing this term'),
	rarity: z.number().int().min(0).max(10).describe(
		'Rarity score 0–10: 0 = extremely common (e.g. "the"), 10 = very rare / obscure',
	),
});

export const chapterExtractionSchema = z.object({
	summary: z.string().describe('Brief chapter summary in simple English, 3-5 sentences'),
	idioms: z.array(languageItemSchema).describe('Idiomatic expressions found in the chapter'),
	phrasalVerbs: z.array(languageItemSchema).describe('Phrasal verbs found in the chapter'),
	rareWords: z.array(languageItemSchema).describe('Uncommon vocabulary for B1-B2 learners'),
});

export type ChapterExtraction = z.infer<typeof chapterExtractionSchema>;
export type LanguageItemExtracted = z.infer<typeof languageItemSchema>;
