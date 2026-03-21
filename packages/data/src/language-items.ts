import { ObjectId, type Db } from 'mongodb';

const COLLECTION = 'languageItems';

export async function deleteLanguageItemsByBookId(db: Db, bookId: string): Promise<void> {
	await db.collection(COLLECTION).deleteMany({ bookId: new ObjectId(bookId) });
}
