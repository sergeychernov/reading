import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import {
	deleteBookProcessingArtifacts,
	getBookById,
	getDb,
	updateBookStatus,
} from '@reading/data';

export const runtime = 'nodejs';

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

		if (book.processingStatus !== 'parsing') {
			return NextResponse.json(
				{ error: 'Revert is allowed only for books with parsing status' },
				{ status: 400 },
			);
		}

		await removeBookArtifacts(bookId);
		await updateBookStatus(db, bookId, 'uploaded');

		return NextResponse.json({
			ok: true,
			bookId,
			processingStatus: 'uploaded',
			failed: false,
		});
	} catch (error) {
		console.error(`Failed to revert book ${bookId}:`, error);
		return NextResponse.json({ error: 'Failed to revert book' }, { status: 500 });
	}
}
