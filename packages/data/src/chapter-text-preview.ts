/** Max code points persisted on `ChapterDocument.textPreview` after extract-chapter. */
export const CHAPTER_TEXT_PREVIEW_MAX_CODE_POINTS = 32;

/**
 * Plain-text preview from extract paragraph list (same join as `ParsedChapterXhtml` stats).
 * Returns at most `maxCodePoints` Unicode scalar values (spread / code-point iteration).
 */
export function chapterTextPreviewFromParagraphs(
	paragraphs: string[],
	maxCodePoints: number,
): string {
	const full = paragraphs.join('\n\n').trim();
	return [...full].slice(0, maxCodePoints).join('');
}
