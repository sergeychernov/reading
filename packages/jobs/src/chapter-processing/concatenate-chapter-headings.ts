/**
 * Builds a single display title from one or more consecutive chapter headings
 * (e.g. numeric label + substantive title).
 */

function normalizeForCompare(s: string): string {
	return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Chapter number only: "1", "12", "IV" (short roman).
 */
function isNumericOrShortRomanLabel(s: string): boolean {
	const t = s.trim();
	if (/^\d{1,3}$/.test(t)) {
		return true;
	}
	if (/^\d{1,3}[.:)\]]?$/.test(t)) {
		return true;
	}
	if (/^[ivxlcdm]{1,6}$/i.test(t) && t.length <= 6) {
		return true;
	}
	return false;
}

/**
 * Merges leading heading texts into one title string.
 *
 * - Duplicate segments (after normalize) collapse to one.
 * - A short numeric/roman label followed by a longer title becomes `"label: title"`.
 * - Otherwise headings are joined with ` — ` when both carry distinct wording.
 */
export function concatenateChapterHeadings(parts: string[]): string {
	const trimmed = parts.map((p) => p.trim()).filter((p) => p.length > 0);
	if (trimmed.length === 0) {
		return '';
	}
	if (trimmed.length === 1) {
		return trimmed[0]!;
	}

	const deduped: string[] = [];
	for (const p of trimmed) {
		const n = normalizeForCompare(p);
		const prev = deduped[deduped.length - 1];
		if (prev !== undefined && normalizeForCompare(prev) === n) {
			continue;
		}
		deduped.push(p);
	}

	if (deduped.length === 1) {
		return deduped[0]!;
	}

	const [first, second, ...rest] = deduped;
	if (
		isNumericOrShortRomanLabel(first!)
		&& !isNumericOrShortRomanLabel(second!)
		&& second!.length > first!.length
	) {
		const core = `${first!.replace(/\s+$/, '')}: ${second!.replace(/^\s+/, '')}`;
		if (rest.length === 0) {
			return core;
		}
		return [core, ...rest].join(' — ');
	}

	return deduped.join(' — ');
}
