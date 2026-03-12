"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildExtractMeaningRuSynapses = buildExtractMeaningRuSynapses;
exports.createExtractMeaningRuJob = createExtractMeaningRuJob;
function buildExtractMeaningRuSynapses(ctx) {
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
function createExtractMeaningRuJob(adapter) {
    return {
        name: 'extract-meaning-ru',
        async execute(rawInput, _options, context) {
            const input = rawInput;
            context.logger.info(`Extracting RU meanings for chapter ${input.chapterIndex}: "${input.chapterTitle}"`);
            const idioms = await adapter.translateMeanings(input.idioms, 'ru');
            const phrasalVerbs = await adapter.translateMeanings(input.phrasalVerbs, 'ru');
            const rareWords = await adapter.translateMeanings(input.rareWords, 'ru');
            context.logger.info(`Extracted RU meanings for chapter ${input.chapterIndex} ` +
                `(${idioms.length} idioms, ${phrasalVerbs.length} phrasal verbs, ${rareWords.length} rare words)`);
            return {
                idioms,
                phrasalVerbs,
                rareWords,
            };
        },
    };
}
