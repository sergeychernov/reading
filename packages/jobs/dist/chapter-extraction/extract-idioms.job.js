"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExtractIdiomsJob = createExtractIdiomsJob;
function createExtractIdiomsJob(adapter) {
    return {
        name: 'extract-idioms',
        async execute(rawInput, _options, context) {
            const input = rawInput;
            context.logger.info(`Extracting idioms for chapter ${input.chapterIndex}: "${input.chapterTitle}"`);
            const idioms = await adapter.extractIdioms(input.chapterText);
            context.logger.info(`Extracted ${idioms.length} idioms for chapter ${input.chapterIndex}`);
            return { idioms };
        },
    };
}
