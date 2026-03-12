"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExtractPhrasalVerbsJob = createExtractPhrasalVerbsJob;
function createExtractPhrasalVerbsJob(adapter) {
    return {
        name: 'extract-phrasal-verbs',
        async execute(rawInput, _options, context) {
            const input = rawInput;
            context.logger.info(`Extracting phrasal verbs for chapter ${input.chapterIndex}: "${input.chapterTitle}"`);
            const phrasalVerbs = await adapter.extractPhrasalVerbs(input.chapterText);
            context.logger.info(`Extracted ${phrasalVerbs.length} phrasal verbs for chapter ${input.chapterIndex}`);
            return { phrasalVerbs };
        },
    };
}
