import { NextResponse } from 'next/server';
import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';
import { deleteChaptersByBookId } from '@reading/data/chapters';
import {
	deleteAllBookStorage,
	deleteBookById,
	deleteBookProcessingArtifacts,
	deleteLanguageItemsByBookId,
	getBookById,
	getDb,
	updateBookChapterCount,
	updateBookStatus,
} from '@reading/data';

export const runtime = 'nodejs';

/** If dev bundler serves a stale @reading/data build, the imported helper may be missing. */
async function deleteChaptersForBook(db: Db, bookId: string): Promise<void> {
	if (typeof deleteChaptersByBookId === 'function') {
		await deleteChaptersByBookId(db, bookId);
		return;
	}
	await db.collection('chapters').deleteMany({ bookId: new ObjectId(bookId) });
}

interface RouteParams {
	params: Promise<{ bookId: string }>;
}

async function removeBookArtifacts(bookId: string): Promise<void> {
	if (typeof deleteBookProcessingArtifacts === 'function') {
		await deleteBookProcessingArtifacts(bookId);
		return;
	}

	// Fallback for dev hot-reload cache when @reading/data index export is stale.
	const { resolve } = await import('node:path');
	const { pathToFileURL } = await import('node:url');
	const blobModuleUrl = pathToFileURL(
		resolve(process.cwd(), 'packages/data/dist/blob.js'),
	).href;
	const blobModule = (await import(blobModuleUrl)) as {
		deleteBookProcessingArtifacts?: (id: string) => Promise<void>;
	};
	const deleteArtifacts = blobModule.deleteBookProcessingArtifacts;

	if (typeof deleteArtifacts !== 'function') {
		throw new Error('deleteBookProcessingArtifacts is not available');
	}

	await deleteArtifacts(bookId);
}

export async function POST(
	_request: Request,
	{ params }: RouteParams,
): Promise<NextResponse> {
	const { bookId } = await params;

	if (!ObjectId.isValid(bookId)) {
		return NextResponse.json({ error: 'Invalid bookId' }, { status: 400 });
	}

	try {
		const db = await getDb();
		const book = await getBookById(db, bookId);

		if (!book) {
			return NextResponse.json({ error: 'Book not found' }, { status: 404 });
		}

		switch (book.processingStatus) {
			case 'parsing':
			case 'parsed':
				await removeBookArtifacts(bookId);
				await deleteChaptersForBook(db, bookId);
				await updateBookChapterCount(db, bookId, 0);
				await updateBookStatus(db, bookId, 'uploaded');
				return NextResponse.json({
					ok: true,
					bookId,
					processingStatus: 'uploaded',
					failed: false,
				});
			case 'uploaded':
				await deleteLanguageItemsByBookId(db, bookId);
				await deleteChaptersForBook(db, bookId);
				await deleteAllBookStorage(bookId);
				await deleteBookById(db, bookId);
				return NextResponse.json({
					ok: true,
					bookId,
					deleted: true,
					failed: false,
				});
			default:
				return NextResponse.json(
					{
						error:
							'Revert is allowed only for books with status parsing, parsed, or uploaded',
					},
					{ status: 400 },
				);
		}

	} catch (error) {
		console.error(`Failed to revert book ${bookId}:`, error);
		return NextResponse.json({ error: 'Failed to revert book' }, { status: 500 });
	}
}
