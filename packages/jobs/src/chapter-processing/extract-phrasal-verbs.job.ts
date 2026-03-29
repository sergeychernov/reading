import type { JobDefinition, JobContext } from 'neuroline';
import type { LanguageItemBase } from '@reading/llm-schemas';
import { downloadBlob } from '@reading/data';
import type { LlmAdapter } from '../types';

const MAX_BATCH_CHARS = 4999;
const MAX_BATCH_ATTEMPTS = 2;
const ALLOWED_PARTICLES = new Set([
	'about',
	'across',
	'after',
	'along',
	'around',
	'aside',
	'away',
	'back',
	'by',
	'down',
	'for',
	'forward',
	'in',
	'off',
	'on',
	'out',
	'over',
	'round',
	'through',
	'together',
	'under',
	'up',
]);

interface ParagraphBatch {
	paragraphs: string[];
	text: string;
}

export interface ExtractPhrasalVerbsFromBlobInput {
	chapterId: string;
	textJsonBlobKey: string;
}

export interface ExtractPhrasalVerbsFromBlobOutput {
	phrasalVerbs: LanguageItemBase[];
}

function buildParagraphBatches(paragraphs: string[]): ParagraphBatch[] {
	const batches: ParagraphBatch[] = [];
	let currentBatch: string[] = [];
	let currentLength = 0;

	for (const rawParagraph of paragraphs) {
		const paragraph = rawParagraph.trim();
		if (!paragraph) {
			continue;
		}
		if (paragraph.length > MAX_BATCH_CHARS) {
			throw new Error(
				`extract-phrasal-verbs: paragraph length ${paragraph.length} exceeds max batch size ${MAX_BATCH_CHARS}`,
			);
		}

		const separatorLength = currentBatch.length > 0 ? 2 : 0;
		const nextLength = currentLength + separatorLength + paragraph.length;

		if (currentBatch.length > 0 && nextLength > MAX_BATCH_CHARS) {
			batches.push(toParagraphBatch(currentBatch));
			currentBatch = [paragraph];
			currentLength = paragraph.length;
			continue;
		}

		currentBatch.push(paragraph);
		currentLength = nextLength;
	}

	if (currentBatch.length > 0) {
		batches.push(toParagraphBatch(currentBatch));
	}

	return batches;
}

function toParagraphBatch(paragraphs: string[]): ParagraphBatch {
	return {
		paragraphs,
		text: paragraphs.join('\n\n'),
	};
}

function formatError(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}

function isStrictPhrasalVerbTerm(term: string): boolean {
	const normalized = term
		.toLowerCase()
		.trim()
		.replace(/\s+/g, ' ');
	if (!normalized) {
		return false;
	}

	const parts = normalized.split(' ');
	if (parts.length < 2 || parts.length > 3) {
		return false;
	}

	const [verb, ...tail] = parts;
	if (!/^[a-z]+(?:-[a-z]+)?$/.test(verb)) {
		return false;
	}

	return tail.every((part) => ALLOWED_PARTICLES.has(part));
}

async function extractBatchWithFallback(
	adapter: LlmAdapter,
	batch: ParagraphBatch,
	context: JobContext,
): Promise<LanguageItemBase[]> {
	let lastError: unknown = null;

	for (let attempt = 1; attempt <= MAX_BATCH_ATTEMPTS; attempt += 1) {
		try {
			return await adapter.extractPhrasalVerbs(batch.text);
		} catch (error) {
			lastError = error;
			context.logger.warn(
				`extract-phrasal-verbs: batch extraction failed (attempt ${attempt}/${MAX_BATCH_ATTEMPTS}, paragraphs=${batch.paragraphs.length}, chars=${batch.text.length}): ${formatError(error)}`,
			);
		}
	}

	if (batch.paragraphs.length <= 1) {
		context.logger.warn(
			`extract-phrasal-verbs: skipping paragraph after ${MAX_BATCH_ATTEMPTS} failed attempt(s): ${formatError(lastError)}`,
		);
		return [];
	}

	const middle = Math.ceil(batch.paragraphs.length / 2);
	const leftBatch = toParagraphBatch(batch.paragraphs.slice(0, middle));
	const rightBatch = toParagraphBatch(batch.paragraphs.slice(middle));

	context.logger.warn(
		`extract-phrasal-verbs: splitting failed batch into two sequential sub-batches (${leftBatch.paragraphs.length} + ${rightBatch.paragraphs.length} paragraphs)`,
	);

	const leftItems = await extractBatchWithFallback(adapter, leftBatch, context);
	const rightItems = await extractBatchWithFallback(adapter, rightBatch, context);
	return [...leftItems, ...rightItems];
}

export function createExtractPhrasalVerbsFromBlobJob(adapter: LlmAdapter): JobDefinition {
	return {
		name: 'extract-phrasal-verbs',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<ExtractPhrasalVerbsFromBlobOutput> {
			const input = rawInput as ExtractPhrasalVerbsFromBlobInput;

			context.logger.info(
				`extract-phrasal-verbs: downloading chapter text from ${input.textJsonBlobKey}`,
			);

			const buf = await downloadBlob(input.textJsonBlobKey);
			const paragraphs = JSON.parse(buf.toString('utf8')) as string[];
			const batches = buildParagraphBatches(paragraphs);
			const extractedByBatch: LanguageItemBase[] = [];

			context.logger.info(
				`extract-phrasal-verbs: extracting in ${batches.length} sequential batch(es), max ${MAX_BATCH_CHARS} chars per batch`,
			);

			for (const [index, batch] of batches.entries()) {
				context.logger.info(
					`extract-phrasal-verbs: batch ${index + 1}/${batches.length} (${batch.text.length} chars)`,
				);
				const items = await extractBatchWithFallback(adapter, batch, context);
				extractedByBatch.push(...items);
			}

			const seen = new Set<string>();
			let droppedByStructure = 0;
			const phrasalVerbs = extractedByBatch.filter((item) => {
				if (!isStrictPhrasalVerbTerm(item.term)) {
					droppedByStructure += 1;
					return false;
				}
				const key = `${item.term.toLowerCase()}|||${item.exampleFromBook}`;
				if (seen.has(key)) {
					return false;
				}
				seen.add(key);
				return true;
			});
			if (droppedByStructure > 0) {
				context.logger.info(
					`extract-phrasal-verbs: dropped ${droppedByStructure} non-phrasal item(s) by strict particle filter`,
				);
			}

			context.logger.info(
				`extract-phrasal-verbs: extracted ${phrasalVerbs.length} phrasal verbs`,
			);

			return { phrasalVerbs };
		},
	};
}
