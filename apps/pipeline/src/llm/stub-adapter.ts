import type { LlmAdapter } from './adapter';
import type { ChapterExtraction } from './schemas';

/**
 * Stub adapter that returns realistic test data.
 * Useful for testing the full pipeline flow without an actual LLM provider.
 */
export class StubAdapter implements LlmAdapter {
	async extractFromChapter(_chapterText: string): Promise<ChapterExtraction> {
		// Simulate LLM latency so pipeline logs are readable
		await new Promise((resolve) => setTimeout(resolve, 100));

		return {
			summary:
				'The chapter introduces the protagonist arriving in a new city. ' +
				'He struggles to find his way around and meets a local who helps him. ' +
				'Through their conversation, the protagonist learns about the history of the area. ' +
				'By the end, he feels more at home and decides to stay longer than planned.',
			idioms: [
				{
					term: 'break the ice',
					meaning: 'To initiate conversation in a social setting, reducing tension or awkwardness',
					exampleFromBook: 'He decided to break the ice by asking about the local cuisine.',
				},
				{
					term: 'beat around the bush',
					meaning: 'To avoid talking about the main topic directly',
					exampleFromBook: 'She kept beating around the bush instead of telling him the real reason she was there.',
				},
				{
					term: 'once in a blue moon',
					meaning: 'Very rarely, almost never',
					exampleFromBook: 'Visitors came to this part of town once in a blue moon.',
				},
			],
			phrasalVerbs: [
				{
					term: 'run into',
					meaning: 'To meet someone unexpectedly',
					exampleFromBook: 'He ran into an old friend at the market square.',
				},
				{
					term: 'figure out',
					meaning: 'To understand or solve something after thinking about it',
					exampleFromBook: 'It took him a while to figure out how the local bus system worked.',
				},
				{
					term: 'settle in',
					meaning: 'To become comfortable in a new place or situation',
					exampleFromBook: 'After a few days, he finally began to settle in.',
				},
			],
			rareWords: [
				{
					term: 'ephemeral',
					meaning: 'Lasting for a very short time',
					exampleFromBook: 'The beauty of the sunset was ephemeral, gone within minutes.',
				},
				{
					term: 'ubiquitous',
					meaning: 'Present, appearing, or found everywhere',
					exampleFromBook: 'Street vendors were ubiquitous in the old quarter of the city.',
				},
				{
					term: 'serendipity',
					meaning: 'The occurrence of events by chance in a happy or beneficial way',
					exampleFromBook: 'It was pure serendipity that he stumbled upon the hidden garden.',
				},
			],
		};
	}
}
