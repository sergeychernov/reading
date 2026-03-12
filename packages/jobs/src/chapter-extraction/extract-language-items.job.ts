import type { JobContext, JobDefinition } from 'neuroline';
import type { LanguageItemBase } from '@reading/llm-schemas';
import type { LlmAdapter } from '../types';
import type { ChapterExtractionInput } from '../types';

export interface ExtractLanguageItemsOutput {
	idioms: LanguageItemBase[];
	phrasalVerbs: LanguageItemBase[];
	rareWords: LanguageItemBase[];
}

function normalizeTerm(term: string): string {
	return term
		.toLowerCase()
		.replace(/\bsomebody\b/g, 'someone')
		.replace(/\bsmb\b/g, 'someone')
		.replace(/\bsb\b/g, 'someone')
		.replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function termTokens(term: string): string[] {
	return normalizeTerm(term).split(' ').filter(Boolean);
}

function dedupeByTerm(items: LanguageItemBase[]): LanguageItemBase[] {
	const seen = new Set<string>();
	const unique: LanguageItemBase[] = [];
	for (const item of items) {
		const key = normalizeTerm(item.term);
		if (!key || seen.has(key)) {
			continue;
		}
		seen.add(key);
		unique.push(item);
	}
	return unique;
}

function removeRareWordsCoveredByMultiword(
	rareWords: LanguageItemBase[],
	protectedItems: LanguageItemBase[],
): LanguageItemBase[] {
	const protectedTerms = protectedItems
		.map((item) => termTokens(item.term))
		.filter((tokens) => tokens.length > 1);

	return rareWords.filter((rareWord) => {
		const rareTokens = termTokens(rareWord.term);
		if (rareTokens.length !== 1) {
			return true;
		}
		const [rareToken] = rareTokens;
		return !protectedTerms.some((tokens) => tokens.includes(rareToken));
	});
}

function reconcileCrossCategoryDuplicates(output: ExtractLanguageItemsOutput): ExtractLanguageItemsOutput {
	const idioms = dedupeByTerm(output.idioms);
	const phrasalVerbs = dedupeByTerm(output.phrasalVerbs);
	const protectedTerms = [...idioms, ...phrasalVerbs];
	const rareWords = removeRareWordsCoveredByMultiword(
		dedupeByTerm(output.rareWords),
		protectedTerms,
	);

	return {
		idioms,
		phrasalVerbs,
		rareWords,
	};
}

export function createExtractLanguageItemsJob(adapter: LlmAdapter): JobDefinition {
	return {
		name: 'extract-language-items',
		async execute(
			rawInput: unknown,
			_options: unknown,
			context: JobContext,
		): Promise<ExtractLanguageItemsOutput> {
			const input = rawInput as ChapterExtractionInput;
			if (typeof input.chapterText !== 'string' || input.chapterText.trim().length === 0) {
				throw new Error('extract-language-items requires non-empty chapterText in job input');
			}

			context.logger.info(
				`Extracting language items in one pass for chapter ${input.chapterIndex}: "${input.chapterTitle}"`,
			);

			const extracted = await adapter.extractLanguageItems(input.chapterText);
			const reconciled = reconcileCrossCategoryDuplicates(extracted);

			context.logger.info(
				`Extracted language items for chapter ${input.chapterIndex} ` +
				`(${reconciled.idioms.length} idioms, ${reconciled.phrasalVerbs.length} phrasal verbs, ${reconciled.rareWords.length} rare words)`,
			);

			return reconciled;
		},
	};
}
