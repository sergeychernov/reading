import { z } from 'zod';
export declare const languageItemSchema: z.ZodObject<{
    term: z.ZodString;
    meaning: z.ZodString;
    exampleFromBook: z.ZodString;
    rarity: z.ZodNumber;
}, z.core.$strip>;
export declare const chapterExtractionSchema: z.ZodObject<{
    summary: z.ZodString;
    idioms: z.ZodArray<z.ZodObject<{
        term: z.ZodString;
        meaning: z.ZodString;
        exampleFromBook: z.ZodString;
        rarity: z.ZodNumber;
    }, z.core.$strip>>;
    phrasalVerbs: z.ZodArray<z.ZodObject<{
        term: z.ZodString;
        meaning: z.ZodString;
        exampleFromBook: z.ZodString;
        rarity: z.ZodNumber;
    }, z.core.$strip>>;
    rareWords: z.ZodArray<z.ZodObject<{
        term: z.ZodString;
        meaning: z.ZodString;
        exampleFromBook: z.ZodString;
        rarity: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ChapterExtraction = z.infer<typeof chapterExtractionSchema>;
export type LanguageItemExtracted = z.infer<typeof languageItemSchema>;
