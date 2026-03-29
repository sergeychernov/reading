import type { JobContext, JobDefinition } from 'neuroline';
import { completeChapterProcessing, withDb } from '@reading/data';

export interface CompleteChapterProcessingInput {
	chapterId: string;
}

export interface CompleteChapterProcessingOutput {
	chapterId: string;
	status: 'completed';
}

/**
 * Sets chapter status to `completed` after extract-chapter persisted kind/title.
 */
export const completeChapterProcessingJob: JobDefinition = {
	name: 'complete-chapter-processing',
	async execute(
		rawInput: unknown,
		_options: unknown,
		_context: JobContext,
	): Promise<CompleteChapterProcessingOutput> {
		const raw = rawInput as Partial<CompleteChapterProcessingInput>;
		const chapterId = typeof raw.chapterId === 'string' ? raw.chapterId.trim() : '';

		if (!chapterId) {
			throw new Error('complete-chapter-processing: chapterId is required');
		}

		await withDb((db) => completeChapterProcessing(db, chapterId));

		return {
			chapterId,
			status: 'completed',
		};
	},
};
