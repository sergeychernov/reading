import type { JobDefinition, JobContext } from 'neuroline';
import { MongoClient, ObjectId } from 'mongodb';

export interface ParseEpubInput {
	bookId: string;
	epubBlobUrl: string;
}

export interface ParseEpubChapter {
	chapterId: string;
	index: number;
	title: string;
	text: string;
}

export interface ParseEpubOutput {
	bookId: string;
	chapters: ParseEpubChapter[];
}

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = 'reading';

/**
 * Loads chapter data from MongoDB.
 *
 * Chapter documents (including rawText) are created during the upload flow
 * in apps/public. This job simply reads them — no EPUB re-downloading
 * or re-parsing is needed.
 */
export const parseEpubJob: JobDefinition = {
	name: 'parse-epub',
	async execute(
		rawInput: unknown,
		_options: unknown,
		context: JobContext,
	): Promise<ParseEpubOutput> {
		const input = rawInput as ParseEpubInput;
		context.logger.info(`Loading chapters for book ${input.bookId}`);

		const client = new MongoClient(MONGODB_URI);
		try {
			await client.connect();
			const db = client.db(DB_NAME);

			const bookOid = new ObjectId(input.bookId);

			const chapterDocs = await db
				.collection('chapters')
				.find({ bookId: bookOid })
				.sort({ chapterIndex: 1 })
				.toArray();

			if (chapterDocs.length === 0) {
				throw new Error(
					`No chapter documents found for book ${input.bookId}`,
				);
			}

			const chapters: ParseEpubChapter[] = chapterDocs.map((doc) => ({
				chapterId: (doc._id as ObjectId).toHexString(),
				index: doc.chapterIndex as number,
				title: doc.title as string,
				text: doc.rawText as string,
			}));

			context.logger.info(
				`Loaded ${chapters.length} chapters from MongoDB`,
			);

			return {
				bookId: input.bookId,
				chapters,
			};
		} finally {
			await client.close();
		}
	},
};
