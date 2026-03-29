import type { JobContext, JobDefinition } from 'neuroline';
import { ObjectId } from 'mongodb';
import {
	getChapterById,
	setChapterPipelineId,
	updateChapterStatus,
	withDb,
} from '@reading/data';
import type { ChapterProcessingInput } from '../types';

export interface StartChapterProcessingOutput {
	bookId: string;
	chapterId: string;
	chapterIndex: number;
}

/**
 * Marks chapter as extracting and stores pipelineId in chapter document.
 */
export const startChapterProcessingJob: JobDefinition = {
	name: 'start-chapter-processing',
	async execute(
		rawInput: unknown,
		_options: unknown,
		context: JobContext,
	): Promise<StartChapterProcessingOutput> {
		const raw = rawInput as Partial<ChapterProcessingInput>;
		const chapterId = typeof raw.chapterId === 'string' ? raw.chapterId.trim() : '';

		if (!chapterId || !ObjectId.isValid(chapterId)) {
			throw new Error('start-chapter-processing: chapterId (valid ObjectId string) is required');
		}

		const { bookId, chapterIndex } = await withDb(async (db) => {
			const chapter = await getChapterById(db, chapterId);
			if (!chapter) {
				throw new Error(`start-chapter-processing: chapter not found: ${chapterId}`);
			}
			await updateChapterStatus(db, chapterId, 'extracting', { failed: false });
			await setChapterPipelineId(db, chapterId, context.pipelineId);
			return {
				bookId: chapter.bookId.toHexString(),
				chapterIndex: chapter.chapterIndex,
			};
		});

		return {
			bookId,
			chapterId,
			chapterIndex,
		};
	},
};
