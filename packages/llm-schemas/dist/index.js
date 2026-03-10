import { z } from 'zod';
export const meaningTranslationsSchema = z.object({
    en: z.string().describe('Simple English explanation'),
    ru: z.string().describe('Russian translation'),
}).describe('Meaning/translation in each supported language');
export const languageItemBaseSchema = z.object({
    term: z.string().describe('The idiom, phrasal verb, or rare word'),
    exampleFromBook: z.string().describe('The exact sentence from the book containing this term'),
});
export const rarityScoreSchema = z.number().int().min(0).max(10).describe('Rarity score 0–10: 0 = extremely common (e.g. "the"), 10 = very rare / obscure');
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
