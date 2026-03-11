"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildExtractMeaningEnSynapses = buildExtractMeaningEnSynapses;
exports.createExtractMeaningEnJob = createExtractMeaningEnJob;
function buildExtractMeaningEnSynapses(ctx) {
    const pipelineInput = ctx.pipelineInput;
    const rarityArtifact = ctx.getArtifact('extract-rarity');
    if (!rarityArtifact) {
        throw new Error('extract-rarity artifact not found');
    }
    return {
        chapterIndex: pipelineInput.chapterIndex,
        chapterTitle: pipelineInput.chapterTitle,
        idioms: rarityArtifact.idioms,
        phrasalVerbs: rarityArtifact.phrasalVerbs,
        rareWords: rarityArtifact.rareWords,
    };
}
function createExtractMeaningEnJob(adapter) {
    return {
        name: 'extract-meaning-en',
        async execute(rawInput, _options, context) {
            const input = rawInput;
            context.logger.info(`Extracting EN meanings for chapter ${input.chapterIndex}: "${input.chapterTitle}"`);
            const idioms = await adapter.translateMeanings(input.idioms, 'en');
            const phrasalVerbs = await adapter.translateMeanings(input.phrasalVerbs, 'en');
            const rareWords = await adapter.translateMeanings(input.rareWords, 'en');
            context.logger.info(`Extracted EN meanings for chapter ${input.chapterIndex} ` +
                `(${idioms.length} idioms, ${phrasalVerbs.length} phrasal verbs, ${rareWords.length} rare words)`);
            return {
                idioms,
                phrasalVerbs,
                rareWords,
            };
        },
    };
}
