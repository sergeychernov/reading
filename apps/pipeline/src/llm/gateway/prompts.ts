import type { LanguageItemBase } from '../schemas';

const BASE_SYSTEM_PROMPT =
	'You are an English language tutor assistant. ' +
	'Your task is to analyze a chapter from an English book and extract language learning material for B1-B2 level learners. ' +
	'Be thorough but selective — only include items that genuinely help a learner expand their vocabulary and understanding.';

export const SUMMARY_SYSTEM_PROMPT =
	'You are an English language tutor assistant. ' +
	'Write a brief summary of the given book chapter in simple English, 3-5 sentences. ' +
	'Cover only the main plot events or ideas. ' +
	'Do NOT include vocabulary lists, idioms, word definitions, or any language learning material — plain narrative summary only.';

export const LANGUAGE_ITEMS_SYSTEM_PROMPT =
	BASE_SYSTEM_PROMPT +
	' Extract idioms, phrasal verbs, and rare words in one pass so categories stay consistent.' +
	' Return JSON with exactly three arrays: idioms, phrasalVerbs, rareWords.' +
	' For each item return only "term" and "exampleFromBook".' +
	' Prefer one best category per expression. Do not duplicate the same meaning across categories.' +
	' If a multi-word idiom or phrasal verb is selected, avoid adding its base verb as a rare word unless the meaning is clearly different in context.';

export const IDIOMS_SYSTEM_PROMPT =
	BASE_SYSTEM_PROMPT +
	' Extract all idiomatic expressions (idioms) found in the chapter.' +
	' An idiom is a fixed multi-word phrase whose meaning cannot be deduced from the individual words (e.g. "break the ice", "once in a blue moon").' +
	' Do NOT include single words, rare vocabulary, or phrasal verbs — those are handled separately.' +
	' Normalize the term to its canonical dictionary form: use "someone" (not "somebody" or "smb"), use infinitive for verbs (e.g. "break the ice", not "broke the ice").' +
	' The same idiom must always appear with the exact same term spelling across all chapters.';

export const PHRASAL_VERBS_SYSTEM_PROMPT =
	BASE_SYSTEM_PROMPT +
	' Extract all phrasal verbs found in the chapter.' +
	' A phrasal verb is a verb combined with one or two particles (preposition or adverb) that together form a new meaning (e.g. "give up", "run into", "look forward to").' +
	' The verb + particle combination must be the core unit — do NOT include fixed multi-word expressions or idioms (e.g. "seize hold of", "make the most of" are idioms, not phrasal verbs).' +
	' Do NOT include bare verbs without a particle, and do NOT include nouns or adjectives.' +
	' Normalize the term to its base (infinitive) form without a subject (e.g. "give up", not "gave up" or "giving up").' +
	' The same phrasal verb must always appear with the exact same term spelling across all chapters.';

export const RARE_WORDS_SYSTEM_PROMPT =
	BASE_SYSTEM_PROMPT +
	' Extract all uncommon single words (rare words) that a B1-B2 learner might not know.' +
	' Only include individual words — do NOT include multi-word expressions, phrases, compound nouns, medical/psychological terms, or proper nouns.' +
	' Normalize the term to its base dictionary form: singular for nouns (e.g. "impulse", not "impulses"), infinitive for verbs (e.g. "wither", not "withered").' +
	' The same word must always appear with the exact same term spelling across all chapters.';

export const RARITY_SYSTEM_PROMPT =
	'You are an English linguistics assistant. ' +
	'Your task is to assign a rarity score from 0 to 10 for each provided English language item. ' +
	'0 means extremely common in everyday English. 10 means very rare or obscure. ' +
	'Return a JSON object with "scores": an array of objects with exact keys "index" and "rarity". ' +
	'Keep the same order by using the given index values. ' +
	'Do not skip any index.';

export const buildMeaningSystemPrompt = (language: 'en' | 'ru'): string => {
	const languageName = language === 'en' ? 'English' : 'Russian';
	return (
		'You are an English language tutor assistant. ' +
		`Your task is to provide one concise and context-aware ${languageName} meaning for each given item. ` +
		'Use the sentence from the book to pick exactly one best meaning for that context. ' +
		'Return a JSON object with "translations": an array of objects with exact keys "index" and "meaning". ' +
		'Do not skip any index. Do not return alternatives.'
	);
};

export const buildSummaryPrompt = (chapterText: string): string =>
	`Summarize the following chapter. Return plain text only, no headers, no bullet points.\n\n${chapterText}`;

/**
 * Includes "json" so providers that require it (e.g. Alibaba/DashScope) for response_format json_object accept the request.
 */
export const buildItemsPrompt = (chapterText: string): string =>
	`Analyze the following chapter and extract the requested language learning items. For each item return only "term" and "exampleFromBook". Return JSON only.\n\n${chapterText}`;

export const buildLanguageItemsPrompt = (chapterText: string): string =>
	`Analyze the chapter and extract language items across all categories. Return JSON only.\n\n${chapterText}`;

export const buildRarityPrompt = (items: LanguageItemBase[]): string => {
	const indexedItems = items.map((item, index) => ({
		index,
		...item,
	}));

	return (
		'Assign rarity for each item. Return JSON only.\n\n' +
		JSON.stringify({ items: indexedItems }, null, 2)
	);
};

export const buildMeaningPrompt = (
	items: LanguageItemBase[],
	language: 'en' | 'ru',
): string => {
	const indexedItems = items.map((item, index) => ({
		index,
		term: item.term,
		exampleFromBook: item.exampleFromBook,
	}));
	return (
		`Provide ${language} meanings for each item using its context sentence. Return JSON only.\n\n` +
		JSON.stringify({ items: indexedItems }, null, 2)
	);
};
