import type { Epub } from '@storyteller-platform/epub' with { 'resolution-mode': 'import' };

/** Raw chapter: index and XHTML content. Title/text extraction is done by downstream jobs. */
export interface ParsedChapter {
	index: number;
	content: string;
}

export interface ParsedBookMetadata {
	title: string;
	author: string;
	description: string;
}

/** Raw metadata as returned by epub.getMetadata(), serialized as JSON for unchanged storage. */
export type MetadataContent = string;

/** Minimal shape of a metadata entry when parsed from metadata.json (no Epub instance). */
export interface RawMetadataEntry {
	type: string;
	value?: string;
	properties?: Record<string, string>;
}

/**
 * Parses title, author and description from raw getMetadata() JSON (e.g. downloaded metadata.json).
 * Use this when you have the JSON blob but no Epub instance.
 */
export function parseMetadataFromRawJson(entries: RawMetadataEntry[]): ParsedBookMetadata {
	const titleEntry = entries.find((e) => e.type === 'dc:title');
	const title = titleEntry?.value?.trim() ?? 'Untitled';

	const creatorEntry = entries.find((e) => e.type === 'dc:creator');
	const author = creatorEntry?.value?.trim()
		?? creatorEntry?.properties?.name?.trim()
		?? 'Unknown Author';

	const descriptionEntry = entries.find((e) => e.type === 'dc:description');
	const description = descriptionEntry?.value?.trim() ?? '';

	return { title, author, description };
}

export interface ParsedCoverImage {
	data: Buffer;
	mediaType: string;
}

export interface ParseEpubResult {
	/** Parsed fields for DB/display (title, author, description). */
	metadata: ParsedBookMetadata;
	/** Raw getMetadata() result as JSON. Save unchanged as metadata.json. */
	metadataContent: MetadataContent;
	chapters: ParsedChapter[];
	cover: ParsedCoverImage | null;
}

/**
 * Parses an EPUB file from a buffer and extracts metadata, chapters and cover image.
 * metadataContent is the raw epub.getMetadata() result (JSON) for unchanged storage.
 */
export async function parseEpub(
	buffer: Buffer,
): Promise<ParseEpubResult> {
	const { Epub: EpubClass } = await import('@storyteller-platform/epub');
	const epub: Epub = await EpubClass.from(buffer);

	const allMetadata = await epub.getMetadata();
	const [metadata, chapters, cover] = await Promise.all([
		extractMetadata(epub, allMetadata),
		extractChapters(epub),
		extractCoverImage(epub),
	]);

	epub.discardAndClose();

	const metadataContent = JSON.stringify(allMetadata, null, 2);
	return { metadata, metadataContent, chapters, cover };
}

async function extractMetadata(
	epub: Epub,
	allMetadata: Awaited<ReturnType<Epub['getMetadata']>>,
): Promise<ParsedBookMetadata> {
	const title = (await epub.getTitle()) ?? 'Untitled';

	const creators = await epub.getCreators();
	const author = creators.length > 0 ? creators[0].name : 'Unknown Author';

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

			chapters.push({
				index: chapters.length,
				content,
			});
		} catch {
			// Skip items that cannot be read
			continue;
		}
	}

	return chapters;
}

/**
 * Extracts a chapter title from XHTML by looking for h1, h2, or h3 elements.
 * Exported for use by jobs that parse chapter content (e.g. save-chapters).
 */
export function extractChapterTitle(xhtml: string): string | null {
	const headingMatch = xhtml.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/is);
	if (headingMatch) {
		// Strip any inner HTML tags from the heading
		return headingMatch[1].replace(/<[^>]+>/g, '').trim() || null;
	}
	return null;
}

/**
 * Extracts the cover image from the EPUB using the library's built-in support.
 *
 * Strategy:
 * 1. epub.getCoverImageItem() — finds manifest item with properties="cover-image" (EPUB3)
 *    or <meta name="cover" content="id"> pointing to a manifest item (EPUB2).
 * 2. Fallback: scan manifest for any image item whose id or href contains "cover".
 */
async function extractCoverImage(epub: Epub): Promise<ParsedCoverImage | null> {
	try {
		// Strategy 1: use library built-in cover detection (EPUB2 + EPUB3)
		const coverItem = await epub.getCoverImageItem();
		if (coverItem) {
			const raw = await epub.getCoverImage();
			if (raw) {
				const mediaType = coverItem.mediaType ?? guessImageMediaType(coverItem.href) ?? 'image/jpeg';
				return { data: Buffer.from(raw), mediaType };
			}
		}

		// Strategy 2: scan manifest for image items with "cover" in id or href
		const manifest = await epub.getManifest();
		for (const item of Object.values(manifest)) {
			const id = item.id.toLowerCase();
			const href = item.href.toLowerCase();
			const mediaType = item.mediaType ?? '';
			if (
				IMAGE_MEDIA_TYPES.has(mediaType) &&
				(id.includes('cover') || href.includes('cover'))
			) {
				try {
					const raw = await epub.readItemContents(item.id);
					if (raw instanceof Uint8Array) {
						return { data: Buffer.from(raw), mediaType };
					}
				} catch {
					// Skip unreadable items
				}
			}
		}

		return null;
	} catch {
		return null;
	}
}

const IMAGE_MEDIA_TYPES = new Set([
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/svg+xml',
]);

function guessImageMediaType(filename: string): string | null {
	const ext = filename.split('.').pop()?.toLowerCase();
	switch (ext) {
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg';
		case 'png':
			return 'image/png';
		case 'gif':
			return 'image/gif';
		case 'webp':
			return 'image/webp';
		case 'svg':
			return 'image/svg+xml';
		default:
			return null;
	}
}
