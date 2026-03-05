import type { Epub } from '@smoores/epub';
import { extractTextFromXhtml } from './text-extractor';

export interface ParsedChapter {
	title: string;
	text: string;
	index: number;
}

export interface ParsedBookMetadata {
	title: string;
	author: string;
	description: string;
}

/**
 * Parses an EPUB file from a buffer and extracts metadata and chapter contents.
 */
export async function parseEpub(
	buffer: Buffer,
): Promise<{ metadata: ParsedBookMetadata; chapters: ParsedChapter[] }> {
	// Dynamic import: @smoores/epub is ESM-only, use import() for CJS compatibility
	const { Epub: EpubClass } = await import('@smoores/epub');
	const epub: Epub = await EpubClass.from(buffer);

	const metadata = await extractMetadata(epub);
	const chapters = await extractChapters(epub);

	await epub.close();

	return { metadata, chapters };
}

async function extractMetadata(epub: Epub): Promise<ParsedBookMetadata> {
	const title = (await epub.getTitle()) ?? 'Untitled';

	const creators = await epub.getCreators();
	const author = creators.length > 0 ? creators[0].name : 'Unknown Author';

	// Try to extract description from metadata
	const allMetadata = await epub.getMetadata();
	const descriptionEntry = allMetadata.find(
		(entry) => entry.type === 'dc:description',
	);
	const description = descriptionEntry?.value ?? '';

	return { title, author, description };
}

async function extractChapters(epub: Epub): Promise<ParsedChapter[]> {
	const chapters: ParsedChapter[] = [];
	const spineItems = await epub.getSpineItems();

	for (let i = 0; i < spineItems.length; i++) {
		const spineItem = spineItems[i];

		try {
			const content = await epub.readItemContents(spineItem.id, 'utf-8');
			if (!content) continue;

			const text = extractTextFromXhtml(content);

			// Skip items with very little text (likely cover pages, copyright, etc.)
			if (text.length < 100) continue;

			chapters.push({
				title: extractChapterTitle(content) ?? `Chapter ${chapters.length + 1}`,
				text,
				index: chapters.length,
			});
		} catch {
			// Skip items that cannot be read
			continue;
		}
	}

	return chapters;
}

/**
 * Attempts to extract a chapter title from the XHTML content
 * by looking for h1, h2, or h3 elements.
 */
function extractChapterTitle(xhtml: string): string | null {
	const headingMatch = xhtml.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/is);
	if (headingMatch) {
		// Strip any inner HTML tags from the heading
		return headingMatch[1].replace(/<[^>]+>/g, '').trim() || null;
	}
	return null;
}
