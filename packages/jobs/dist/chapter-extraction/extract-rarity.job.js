"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildExtractRaritySynapses = buildExtractRaritySynapses;
exports.createExtractRarityJob = createExtractRarityJob;
function buildExtractRaritySynapses(ctx) {
    const pipelineInput = ctx.pipelineInput;
    const idiomsArtifact = ctx.getArtifact('extract-idioms');
    const phrasalVerbsArtifact = ctx.getArtifact('extract-phrasal-verbs');
    const rareWordsArtifact = ctx.getArtifact('extract-rare-words');
    if (!idiomsArtifact)
        throw new Error('extract-idioms artifact not found');
    if (!phrasalVerbsArtifact)
        throw new Error('extract-phrasal-verbs artifact not found');
    if (!rareWordsArtifact)
        throw new Error('extract-rare-words artifact not found');
    return {
        chapterIndex: pipelineInput.chapterIndex,
        chapterTitle: pipelineInput.chapterTitle,
        idioms: idiomsArtifact.idioms,
        phrasalVerbs: phrasalVerbsArtifact.phrasalVerbs,
        rareWords: rareWordsArtifact.rareWords,
    };
}
function createExtractRarityJob(adapter) {
    return {
        name: 'extract-rarity',
        async execute(rawInput, _options, context) {
            const input = rawInput;
            context.logger.info(`Extracting rarity for chapter ${input.chapterIndex}: "${input.chapterTitle}"`);
            const allItems = [
                ...input.idioms,
                ...input.phrasalVerbs,
                ...input.rareWords,
            ];
            const enrichedItems = await adapter.extractRarity(allItems);
            const idiomsEnd = input.idioms.length;
            const phrasalVerbsEnd = idiomsEnd + input.phrasalVerbs.length;
            const idioms = enrichedItems.slice(0, idiomsEnd);
            const phrasalVerbs = enrichedItems.slice(idiomsEnd, phrasalVerbsEnd);
            const rareWords = enrichedItems.slice(phrasalVerbsEnd);
            context.logger.info(`Rarity extracted for chapter ${input.chapterIndex} ` +
                `(${idioms.length} idioms, ${phrasalVerbs.length} phrasal verbs, ${rareWords.length} rare words)`);
            return {
                idioms,
                phrasalVerbs,
                rareWords,
            };
        },
    };
}
