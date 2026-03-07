/**
 * System prompt for chapter extraction (any gateway model).
 */
export const SYSTEM_PROMPT =
	'You are an English language tutor assistant. ' +
	'Your task is to analyze a chapter from an English book and extract language learning material for B1-B2 level learners. ' +
	'Be thorough but selective — only include items that genuinely help a learner expand their vocabulary and understanding.';

/**
 * Builds the user prompt for chapter extraction.
 * Includes "json" so providers that require it (e.g. Alibaba/DashScope) for response_format json_object accept the request.
 */
export const buildUserPrompt = (chapterText: string): string =>
	`Analyze the following chapter and extract language learning material. Return the result as JSON only.\n\n${chapterText}`;
