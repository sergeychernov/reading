import type { ChapterKind } from '@reading/data';
import { parseDocument, DomUtils } from 'htmlparser2';
import type { Document, Element } from 'domhandler';
import { concatenateChapterHeadings } from './concatenate-chapter-headings';

const TOC_HEADING_PATTERN = /^(table of contents|contents|toc)$/i;

const PARSE_OPTS = { xmlMode: true } as const;

/**
 * Lazily parses chapter XHTML once and exposes `ChapterKind`, headings, title,
 * and plain-text body stats via getters (single DOM parse per instance).
 */
export class ParsedChapterXhtml {
	private readonly xhtml: string;
	private _doc: Document | undefined;
	private _paragraphs: string[] | undefined;
	private _fullParagraphText: string | undefined;
	private _paragraphTextStats: { characterCount: number; wordCount: number } | undefined;

	constructor(xhtml: string) {
		this.xhtml = xhtml;
	}

	get doc(): Document {
		this._doc ??= ParsedChapterXhtml.#parseDocument(this.xhtml);
		return this._doc;
	}

	get kind(): ChapterKind {
		return ParsedChapterXhtml.#classifyDocument(this.doc);
	}

	get headingParts(): string[] {
		return ParsedChapterXhtml.#leadingHeadingPlainTextsFromDocument(this.doc);
	}

	get title(): string {
		const kind = this.kind;
		const headingParts = this.headingParts;

		if (headingParts.length > 0) {
			if (kind === 'table-of-contents') {
				return headingParts[0]!;
			}
			return concatenateChapterHeadings(headingParts);
		}

		return ParsedChapterXhtml.#documentTitlePlainTextFromDocument(this.doc) ?? '';
	}

	/** Serialised inner markup of `<body>`. */
	get bodyInner(): string | null {
		const body = ParsedChapterXhtml.#getBody(this.doc);
		if (!body) {
			return null;
		}
		return DomUtils.getInnerHTML(body, { xmlMode: true });
	}

	/** Plain text of `<title>` in `<head>` (not the derived chapter title). */
	get headTitlePlainText(): string | null {
		return ParsedChapterXhtml.#documentTitlePlainTextFromDocument(this.doc);
	}

	/** Non-empty plain-text segments from `<p>` elements under `<body>` (document order). */
	get paragraphs(): string[] {
		this._paragraphs ??= ParsedChapterXhtml.#paragraphsFromDocument(this.doc);
		return this._paragraphs;
	}

	/**
	 * Unicode code-point length of `paragraphs` joined with blank lines (same basis as `chapterTextCharCount` in MongoDB).
	 */
	get characterCount(): number {
		return this.#paragraphTextStats().characterCount;
	}

	/**
	 * Whitespace-separated token count in the full paragraph text (after trim).
	 */
	get wordCount(): number {
		return this.#paragraphTextStats().wordCount;
	}

	#paragraphTextStats(): { characterCount: number; wordCount: number } {
		this._paragraphTextStats ??= ParsedChapterXhtml.#computeParagraphTextStats(
			this.#joinedParagraphPlainText(),
		);
		return this._paragraphTextStats;
	}

	static #computeParagraphTextStats(fullText: string): {
		characterCount: number;
		wordCount: number;
	} {
		const trimmed = fullText.trim();
		return {
			characterCount: [...trimmed].length,
			wordCount: trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length,
		};
	}

	#joinedParagraphPlainText(): string {
		this._fullParagraphText ??= this.paragraphs.join('\n\n');
		return this._fullParagraphText;
	}

	static #parseDocument(xhtml: string): Document {
		return parseDocument(xhtml, PARSE_OPTS);
	}

	static #getBody(doc: Document): Element | null {
		return DomUtils.findOne(
			(el): el is Element => DomUtils.isTag(el) && el.name === 'body',
			doc,
			true,
		);
	}

	static #metaIsCalibreCover(meta: Element): boolean {
		if (meta.name !== 'meta') {
			return false;
		}
		let nameAttr: string | undefined;
		let contentAttr: string | undefined;
		for (const [key, value] of Object.entries(meta.attribs)) {
			const k = key.toLowerCase();
			if (k === 'name') {
				nameAttr = value;
			}
			if (k === 'content') {
				contentAttr = value;
			}
		}
		return (
			nameAttr?.toLowerCase() === 'calibre:cover'
			&& contentAttr?.trim().toLowerCase() === 'true'
		);
	}

	static #hasCalibreCoverMeta(doc: Document): boolean {
		const metas = DomUtils.findAll(
			(el) => DomUtils.isTag(el) && el.name === 'meta',
			doc,
		);
		return metas.some((m) => ParsedChapterXhtml.#metaIsCalibreCover(m));
	}

	static #navIsEpubToc(nav: Element): boolean {
		if (nav.name !== 'nav') {
			return false;
		}
		for (const [key, value] of Object.entries(nav.attribs)) {
			if (key.toLowerCase() === 'epub:type' && value.trim().toLowerCase() === 'toc') {
				return true;
			}
		}
		return false;
	}

	static #hasEpubTocNav(doc: Document): boolean {
		const navs = DomUtils.findAll(
			(el) => DomUtils.isTag(el) && el.name === 'nav',
			doc,
		);
		return navs.some((n) => ParsedChapterXhtml.#navIsEpubToc(n));
	}

	static #normalizePlainText(s: string): string {
		return s.replace(/\s+/g, ' ').trim();
	}

	static #getLeadingHeadingPlainTextsFromBody(body: Element): string[] {
		const headings: string[] = [];
		for (const child of body.children) {
			if (DomUtils.isText(child)) {
				if (!/^\s*$/.test(child.data)) {
					break;
				}
				continue;
			}
			if (!DomUtils.isTag(child)) {
				continue;
			}
			const tag = child.name.toLowerCase();
			if (/^h[1-6]$/.test(tag)) {
				const t = ParsedChapterXhtml.#normalizePlainText(DomUtils.textContent(child));
				if (t.length > 0) {
					headings.push(t);
				}
				continue;
			}
			break;
		}
		return headings;
	}

	static #firstMeaningfulHeadingTextFromDocument(doc: Document): string | null {
		const body = ParsedChapterXhtml.#getBody(doc);
		if (!body) {
			return null;
		}
		const leading = ParsedChapterXhtml.#getLeadingHeadingPlainTextsFromBody(body);
		return leading[0] ?? null;
	}

	static #isTocHeadingText(text: string): boolean {
		return TOC_HEADING_PATTERN.test(text.trim());
	}

	static #leadingHeadingPlainTextsFromDocument(doc: Document): string[] {
		const body = ParsedChapterXhtml.#getBody(doc);
		if (!body) {
			return [];
		}
		return ParsedChapterXhtml.#getLeadingHeadingPlainTextsFromBody(body);
	}

	static #documentTitlePlainTextFromDocument(doc: Document): string | null {
		const titles = DomUtils.getElementsByTagName('title', doc, true);
		const first = titles[0];
		if (!first) {
			return null;
		}
		const t = ParsedChapterXhtml.#normalizePlainText(DomUtils.textContent(first));
		return t.length > 0 ? t : null;
	}

	static #paragraphsFromDocument(doc: Document): string[] {
		const body = ParsedChapterXhtml.#getBody(doc);
		if (!body) {
			return [];
		}
		const ps = DomUtils.findAll(
			(el): el is Element => DomUtils.isTag(el) && el.name === 'p',
			body,
		);
		const out: string[] = [];
		for (const p of ps) {
			const t = ParsedChapterXhtml.#normalizePlainText(DomUtils.textContent(p));
			if (t.length > 0) {
				out.push(t);
			}
		}
		return out;
	}

	static #classifyDocument(doc: Document): ChapterKind {
		if (ParsedChapterXhtml.#hasCalibreCoverMeta(doc)) {
			return 'cover';
		}
		if (ParsedChapterXhtml.#hasEpubTocNav(doc)) {
			return 'table-of-contents';
		}
		const firstHeading = ParsedChapterXhtml.#firstMeaningfulHeadingTextFromDocument(doc);
		if (firstHeading && ParsedChapterXhtml.#isTocHeadingText(firstHeading)) {
			return 'table-of-contents';
		}
		return 'content';
	}
}
