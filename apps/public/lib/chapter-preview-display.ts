/** Matches extract stats: compare code-point length to full chapter char count. */
export function chapterPreviewLine(
	stored: string,
	chapterTextCharCount: number | undefined,
): string {
	if (stored.length === 0) {
		return '';
	}
	const previewCodePoints = [...stored].length;
	if (
		chapterTextCharCount !== undefined
		&& chapterTextCharCount > previewCodePoints
	) {
		return `${stored}…`;
	}
	return stored;
}
