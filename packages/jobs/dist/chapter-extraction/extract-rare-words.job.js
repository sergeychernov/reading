"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExtractRareWordsJob = createExtractRareWordsJob;
function createExtractRareWordsJob(adapter) {
    return {
        name: 'extract-rare-words',
        async execute(rawInput, _options, context) {
            const input = rawInput;
            context.logger.info(`Extracting rare words for chapter ${input.chapterIndex}: "${input.chapterTitle}"`);
            const rareWords = await adapter.extractRareWords(input.chapterText);
            context.logger.info(`Extracted ${rareWords.length} rare words for chapter ${input.chapterIndex}`);
            return { rareWords };
        },
    };
}
