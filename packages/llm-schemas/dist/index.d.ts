import { z } from 'zod';
export declare const meaningTranslationsSchema: z.ZodObject<{
    en: z.ZodString;
    ru: z.ZodString;
}, z.core.$strip>;
export declare const languageItemBaseSchema: z.ZodObject<{
    term: z.ZodString;
    exampleFromBook: z.ZodString;
}, z.core.$strip>;
export declare const rarityScoreSchema: z.ZodNumber;
export declare const languageItemScoredSchema: z.ZodObject<{
    term: z.ZodString;
    exampleFromBook: z.ZodString;
    rarity: z.ZodNumber;
}, z.core.$strip>;
export declare const languageItemSchema: z.ZodObject<{
    term: z.ZodString;
    exampleFromBook: z.ZodString;
    meaning: z.ZodObject<{
        en: z.ZodString;
        ru: z.ZodString;
    }, z.core.$strip>;
    rarity: z.ZodNumber;
}, z.core.$strip>;
export declare const chapterExtractionSchema: z.ZodObject<{
    summary: z.ZodString;
    idioms: z.ZodArray<z.ZodObject<{
        term: z.ZodString;
        meaning: z.ZodObject<{
            en: z.ZodString;
            ru: z.ZodString;
        }, z.core.$strip>;
        exampleFromBook: z.ZodString;
        rarity: z.ZodNumber;
    }, z.core.$strip>>;
    phrasalVerbs: z.ZodArray<z.ZodObject<{
        term: z.ZodString;
        meaning: z.ZodObject<{
            en: z.ZodString;
            ru: z.ZodString;
        }, z.core.$strip>;
        exampleFromBook: z.ZodString;
        rarity: z.ZodNumber;
    }, z.core.$strip>>;
    rareWords: z.ZodArray<z.ZodObject<{
        term: z.ZodString;
        meaning: z.ZodObject<{
            en: z.ZodString;
            ru: z.ZodString;
        }, z.core.$strip>;
        exampleFromBook: z.ZodString;
        rarity: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type MeaningTranslations = z.infer<typeof meaningTranslationsSchema>;
export type ChapterExtraction = z.infer<typeof chapterExtractionSchema>;
export type LanguageItemBase = z.infer<typeof languageItemBaseSchema>;
export type LanguageItemScored = z.infer<typeof languageItemScoredSchema>;
export type LanguageItemExtracted = z.infer<typeof languageItemSchema>;
