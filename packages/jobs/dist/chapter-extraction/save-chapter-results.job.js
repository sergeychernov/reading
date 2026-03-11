"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveChapterResultsJob = void 0;
exports.buildSaveChapterResultsSynapses = buildSaveChapterResultsSynapses;
const mongodb_1 = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'reading';
function applyMeaningsByLanguage(items, enMeanings, ruMeanings) {
    return items.map((item, index) => ({
        ...item,
        meaning: {
            en: enMeanings[index] ?? item.term,
            ru: ruMeanings[index] ?? item.term,
        },
    }));
}
/**
 * Builds the synapses input for save-chapter-results by collecting
 * artifacts from summary, rarity, and per-language meaning extraction jobs.
 */
function buildSaveChapterResultsSynapses(ctx) {
    const pipelineInput = ctx.pipelineInput;
    const summaryArtifact = ctx.getArtifact('extract-summary');
    const rarityArtifact = ctx.getArtifact('extract-rarity');
    const meaningEnArtifact = ctx.getArtifact('extract-meaning-en');
    const meaningRuArtifact = ctx.getArtifact('extract-meaning-ru');
    if (!summaryArtifact)
        throw new Error('extract-summary artifact not found');
    if (!rarityArtifact)
        throw new Error('extract-rarity artifact not found');
    if (!meaningEnArtifact)
        throw new Error('extract-meaning-en artifact not found');
    if (!meaningRuArtifact)
        throw new Error('extract-meaning-ru artifact not found');
    return {
        bookId: pipelineInput.bookId,
        chapterId: pipelineInput.chapterId,
        chapterIndex: pipelineInput.chapterIndex,
        chapterTitle: pipelineInput.chapterTitle,
        summary: summaryArtifact.summary,
        idioms: applyMeaningsByLanguage(rarityArtifact.idioms, meaningEnArtifact.idioms, meaningRuArtifact.idioms),
        phrasalVerbs: applyMeaningsByLanguage(rarityArtifact.phrasalVerbs, meaningEnArtifact.phrasalVerbs, meaningRuArtifact.phrasalVerbs),
        rareWords: applyMeaningsByLanguage(rarityArtifact.rareWords, meaningEnArtifact.rareWords, meaningRuArtifact.rareWords),
    };
}
/**
 * Saves all extracted language items and chapter summary to MongoDB.
 * Marks chapter as 'completed' on success, 'failed' on error.
 * Idempotent: clears previous language items before inserting.
 */
exports.saveChapterResultsJob = {
    name: 'save-chapter-results',
    async execute(rawInput, _options, context) {
        const input = rawInput;
        const bookOid = new mongodb_1.ObjectId(input.bookId);
        const chapterOid = new mongodb_1.ObjectId(input.chapterId);
        context.logger.info(`Saving extraction results for chapter ${input.chapterIndex}: "${input.chapterTitle}"`);
        const client = new mongodb_1.MongoClient(MONGODB_URI);
        try {
            await client.connect();
            const db = client.db(DB_NAME);
            const now = new Date();
            const languageItems = [
                ...input.idioms.map((item) => ({
                    bookId: bookOid,
                    chapterId: chapterOid,
                    category: 'idiom',
                    term: item.term,
                    meaning: item.meaning,
                    exampleFromBook: item.exampleFromBook,
                    rarity: item.rarity,
                    createdAt: now,
                })),
                ...input.phrasalVerbs.map((item) => ({
                    bookId: bookOid,
                    chapterId: chapterOid,
                    category: 'phrasal_verb',
                    term: item.term,
                    meaning: item.meaning,
                    exampleFromBook: item.exampleFromBook,
                    rarity: item.rarity,
                    createdAt: now,
                })),
                ...input.rareWords.map((item) => ({
                    bookId: bookOid,
                    chapterId: chapterOid,
                    category: 'rare_word',
                    term: item.term,
                    meaning: item.meaning,
                    exampleFromBook: item.exampleFromBook,
                    rarity: item.rarity,
                    createdAt: now,
                })),
            ];
            // Idempotent: clear previous items before inserting (safe for retries)
            await db.collection('languageItems').deleteMany({ chapterId: chapterOid });
            if (languageItems.length > 0) {
                await db.collection('languageItems').insertMany(languageItems);
            }
            await db.collection('chapters').updateOne({ _id: chapterOid }, {
                $set: {
                    summary: input.summary || null,
                    processingStatus: 'completed',
                    updatedAt: new Date(),
                },
            });
            context.logger.info(`Saved ${languageItems.length} language items for chapter ${input.chapterIndex} ` +
                `(${input.idioms.length} idioms, ${input.phrasalVerbs.length} phrasal verbs, ${input.rareWords.length} rare words)`);
            return {
                chapterIndex: input.chapterIndex,
                itemsSaved: languageItems.length,
            };
        }
        catch (error) {
            const errorType = error != null
                ? Object.getPrototypeOf(error)?.constructor?.name ?? typeof error
                : 'null';
            const errorMessage = error instanceof Error
                ? (error.stack ?? error.message)
                : String(error);
            console.error(`[save-chapter-results] Chapter ${input.chapterIndex} FAILED [${errorType}]:`, errorMessage, error);
            context.logger.error(`Chapter ${input.chapterIndex} "${input.chapterTitle}" failed [${errorType}]: ${errorMessage}`);
            try {
                const db = client.db(DB_NAME);
                await db.collection('chapters').updateOne({ _id: chapterOid }, { $set: { processingStatus: 'failed', updatedAt: new Date() } });
            }
            catch (updateErr) {
                context.logger.error(`Failed to mark chapter as failed: ${updateErr}`);
            }
            throw error;
        }
        finally {
            await client.close();
        }
    },
};
