import type { JobDefinition, JobContext, SynapseContext } from 'neuroline';
import { withDb, downloadBlob, updateBookMeta } from '@reading/data';
import { parseMetadataFromRawJson } from '@reading/epub-utils';
import type { RawMetadataEntry } from '@reading/epub-utils';
import type { ExtractBookOutput } from './extract-book.job';

export interface ParseMetadataInput {
	bookId: string;
	metadataUrl: string;
}

export interface ParseMetadataOutput {
	bookId: string;
	title: string;
	author: string;
}

/**
 * Builds input for parse-metadata from the extract-book stage artifact.
 * Use in pipeline: synapses: buildParseMetadataSynapses
 */
export function buildParseMetadataSynapses(ctx: SynapseContext): ParseMetadataInput {
	const artifact = ctx.getArtifact<ExtractBookOutput>('extract-book');
	if (!artifact) {
		throw new Error('extract-book artifact is missing');
	}
	return {
		bookId: artifact.bookId,
		metadataUrl: artifact.metadataUrl,
	};
}

export const parseMetadataJob: JobDefinition<ParseMetadataInput, ParseMetadataOutput> = {
	name: 'parse-metadata',
	async execute(
		input: ParseMetadataInput,
		_options: unknown,
		context: JobContext,
	): Promise<ParseMetadataOutput> {
		const { bookId, metadataUrl } = input;
		context.logger.info(`parse-metadata started for ${bookId}`);

		const buffer = await downloadBlob(metadataUrl);
		const raw = JSON.parse(buffer.toString('utf-8')) as RawMetadataEntry[];
		const metadata = parseMetadataFromRawJson(raw);

		await withDb((db) =>
			updateBookMeta(db, bookId, {
				title: metadata.title,
				author: metadata.author,
				description: metadata.description,
			}),
		);

		context.logger.info(`parse-metadata completed for ${bookId}: "${metadata.title}" by "${metadata.author}"`);
		return {
			bookId,
			title: metadata.title,
			author: metadata.author,
		};
	},
};
