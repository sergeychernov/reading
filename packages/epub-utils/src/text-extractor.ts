import { Parser } from 'htmlparser2';

/**
 * Extracts plain text from XHTML content by stripping all HTML tags.
 * Preserves whitespace and paragraph breaks for readability.
 */
export function extractTextFromXhtml(xhtml: string): string {
	const textParts: string[] = [];
	let inBody = false;
	let skipContent = false;

	const parser = new Parser({
		onopentag(name) {
			if (name === 'body') {
				inBody = true;
			}
			if (name === 'style' || name === 'script') {
				skipContent = true;
			}
			// Add line breaks for block elements
			if (inBody && isBlockElement(name) && textParts.length > 0) {
				textParts.push('\n');
			}
		},
		ontext(text) {
			if (inBody && !skipContent) {
				textParts.push(text);
			}
		},
		onclosetag(name) {
			if (name === 'body') {
				inBody = false;
			}
			if (name === 'style' || name === 'script') {
				skipContent = false;
			}
		},
	});

	parser.write(xhtml);
	parser.end();

	// If no <body> was found, try extracting all text
	if (textParts.length === 0) {
		const fallbackParts: string[] = [];
		const fallbackParser = new Parser({
			ontext(text) {
				fallbackParts.push(text);
			},
		});
		fallbackParser.write(xhtml);
		fallbackParser.end();
		return normalizeWhitespace(fallbackParts.join(''));
	}

	return normalizeWhitespace(textParts.join(''));
}

function isBlockElement(name: string): boolean {
	const blockElements = new Set([
		'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
		'blockquote', 'pre', 'li', 'br', 'hr', 'section',
		'article', 'aside', 'header', 'footer', 'nav',
	]);
	return blockElements.has(name);
}

function normalizeWhitespace(text: string): string {
	return text
		.replace(/[ \t]+/g, ' ')
		.replace(/\n\s*\n/g, '\n\n')
		.replace(/^\s+|\s+$/g, '')
		.replace(/\n{3,}/g, '\n\n');
}
