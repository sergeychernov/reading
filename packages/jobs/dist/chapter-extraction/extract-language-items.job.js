"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExtractLanguageItemsJob = createExtractLanguageItemsJob;
function normalizeTerm(term) {
    return term
        .toLowerCase()
        .replace(/\bsomebody\b/g, 'someone')
        .replace(/\bsmb\b/g, 'someone')
        .replace(/\bsb\b/g, 'someone')
        .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function termTokens(term) {
    return normalizeTerm(term).split(' ').filter(Boolean);
}
function dedupeByTerm(items) {
    const seen = new Set();
    const unique = [];
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
function removeRareWordsCoveredByMultiword(rareWords, protectedItems) {
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
function reconcileCrossCategoryDuplicates(output) {
    const idioms = dedupeByTerm(output.idioms);
    const phrasalVerbs = dedupeByTerm(output.phrasalVerbs);
    const protectedTerms = [...idioms, ...phrasalVerbs];
    const rareWords = removeRareWordsCoveredByMultiword(dedupeByTerm(output.rareWords), protectedTerms);
    return {
        idioms,
        phrasalVerbs,
        rareWords,
    };
}
function createExtractLanguageItemsJob(adapter) {
    return {
        name: 'extract-language-items',
        async execute(rawInput, _options, context) {
            const input = rawInput;
            if (typeof input.chapterText !== 'string' || input.chapterText.trim().length === 0) {
                throw new Error('extract-language-items requires non-empty chapterText in job input');
            }
            context.logger.info(`Extracting language items in one pass for chapter ${input.chapterIndex}: "${input.chapterTitle}"`);
            const extracted = await adapter.extractLanguageItems(input.chapterText);
            const reconciled = reconcileCrossCategoryDuplicates(extracted);
            context.logger.info(`Extracted language items for chapter ${input.chapterIndex} ` +
                `(${reconciled.idioms.length} idioms, ${reconciled.phrasalVerbs.length} phrasal verbs, ${reconciled.rareWords.length} rare words)`);
            return reconciled;
        },
    };
}
