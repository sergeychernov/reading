"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExtractSummaryJob = createExtractSummaryJob;
function createExtractSummaryJob(adapter) {
    return {
        name: 'extract-summary',
        async execute(rawInput, _options, context) {
            const input = rawInput;
            context.logger.info(`Extracting summary for chapter ${input.chapterIndex}: "${input.chapterTitle}"`);
            const summary = await adapter.extractSummary(input.chapterText);
            context.logger.info(`Summary extracted for chapter ${input.chapterIndex} (${summary.length} chars)`);
            return { summary };
        },
    };
}
