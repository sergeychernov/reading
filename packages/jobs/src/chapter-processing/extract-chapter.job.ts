import type { JobDefinition, JobContext } from 'neuroline';
import { ObjectId } from 'mongodb';
import {
	bookFileKey,
	CHAPTER_TEXT_PREVIEW_MAX_CODE_POINTS,
	chapterTextPreviewFromParagraphs,
	downloadBlob,
	type ChapterKind,
	getChapterById,
	withDb,
	updateChapterExtractFields,
	updateChapterStatus,
	uploadBookFile,
} from '@reading/data';
import type { ChapterProcessingInput } from '../types';
import { ParsedChapterXhtml } from './parsed-chapter-xhtml';

export interface ExtractChapterOutput {
	bookId: string;
	chapterId: string;
	chapterIndex: number;
	blobKey: string;
	kind: ChapterKind;
	/** Merged title from headings or `<title>` fallback */
	title: string;
	headingParts: string[];
	byteLength: number;
	characterCount: number;
	wordCount: number;
	/**
	 * Blob key `books/{bookId}/chapters/{n}.json` — JSON array of paragraph strings.
	 * Follow-up jobs should load body text from Blob (not from this job artifact).
	 */
	textJsonBlobKey: string;
}

/**
 * Loads one chapter XHTML from Blob, classifies it (cover / TOC / content),
 * derives title and stats, writes paragraph JSON to Blob, updates MongoDB.
 * Does not return paragraph text — consumers read `textJsonBlobKey` via storage.
 */
export const extractChapterJob: JobDefinition = {
	name: 'extract-chapter',
	async execute(
		rawInput: unknown,
		_options: unknown,
		context: JobContext,
	): Promise<ExtractChapterOutput> {
		const raw = rawInput as Partial<ChapterProcessingInput>;
		const chapterId = typeof raw.chapterId === 'string' ? raw.chapterId.trim() : '';
		if (!chapterId || !ObjectId.isValid(chapterId)) {
			throw new Error('extract-chapter: chapterId (valid ObjectId string) is required');
		}

		const chapter = await withDb((db) => getChapterById(db, chapterId));
		if (!chapter) {
			throw new Error(`extract-chapter: chapter not found: ${chapterId}`);
		}
		const bookId = chapter.bookId.toHexString();
		const chapterIndex = chapter.chapterIndex;
		if (!Number.isFinite(chapterIndex) || chapterIndex < 0) {
			throw new Error(`extract-chapter: invalid chapterIndex on chapter ${chapterId}`);
		}
		const relPath = `chapters/${chapterIndex}.xhtml`;
		const blobKey = bookFileKey(bookId, relPath);
		context.logger.info(`extract-chapter: downloading ${blobKey}`);

		try {
			const buf = await downloadBlob(blobKey);
			const xhtml = buf.toString('utf8');
			const parsed = new ParsedChapterXhtml(xhtml);
			const kind = parsed.kind;
			const title = parsed.title;
			const headingParts = parsed.headingParts;
			const jsonRelPath = `chapters/${chapterIndex}.json`;
			const textJsonBlobKey = bookFileKey(bookId, jsonRelPath);
			const characterCount = parsed.characterCount;
			const wordCount = parsed.wordCount;
			const textPreview = chapterTextPreviewFromParagraphs(
				parsed.paragraphs,
				CHAPTER_TEXT_PREVIEW_MAX_CODE_POINTS,
			);

			context.logger.info(
				`extract-chapter: bookId=${bookId} index=${chapterIndex} kind=${kind} title=${JSON.stringify(title)} chars=${characterCount} words=${wordCount}`,
			);

			await uploadBookFile(
				bookId,
				jsonRelPath,
				JSON.stringify(parsed.paragraphs),
				'application/json',
			);

			await withDb((db) => updateChapterExtractFields(db, chapterId, {
				chapterKind: kind,
				title,
				chapterTextCharCount: characterCount,
				chapterTextWordCount: wordCount,
				textPreview,
			}));

			return {
				bookId,
				chapterId,
				chapterIndex,
				blobKey,
				kind,
				title,
				headingParts,
				byteLength: buf.byteLength,
				characterCount,
				wordCount,
				textJsonBlobKey,
			};
		} catch (error) {
			try {
				await withDb((db) => updateChapterStatus(db, chapterId, 'pending', {
					failed: true,
				}));
			} catch (statusError) {
				context.logger.error(
					`extract-chapter: failed to mark chapter ${chapterId} as failed: ${String(statusError)}`,
				);
			}
			throw error;
		}
	},
};
