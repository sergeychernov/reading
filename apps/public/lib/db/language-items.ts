import { ObjectId } from 'mongodb';
import { getDb } from '@reading/data';
import type { LanguageItemCategory } from '@reading/data';
import type { LanguageItemDocument, LanguageItemInsert } from '../types/language-item';

async function collection() {
	const db = await getDb();
	return db.collection<LanguageItemDocument>('languageItems');
}

export async function getLanguageItemsByChapter(
	chapterId: string,
	category?: LanguageItemCategory,
): Promise<LanguageItemDocument[]> {
	const col = await collection();
	const filter: Record<string, unknown> = { chapterId: new ObjectId(chapterId) };
	if (category) {
		filter.category = category;
	}
	return col.find(filter).toArray();
}

export async function getLanguageItemsByBook(
	bookId: string,
	category?: LanguageItemCategory,
): Promise<LanguageItemDocument[]> {
	const col = await collection();
	const filter: Record<string, unknown> = { bookId: new ObjectId(bookId) };
	if (category) {
		filter.category = category;
	}
	return col.find(filter).toArray();
}

export async function insertManyLanguageItems(
	items: LanguageItemInsert[],
): Promise<void> {
	if (items.length === 0) return;
	const col = await collection();
	await col.insertMany(items as LanguageItemDocument[]);
}

export async function deleteLanguageItemsByChapter(
	chapterId: string,
): Promise<void> {
	const col = await collection();
	await col.deleteMany({ chapterId: new ObjectId(chapterId) });
}
