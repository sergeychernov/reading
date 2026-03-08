import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { clientPromise } from './lib/mongodb';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	adapter: MongoDBAdapter(clientPromise, { databaseName: 'reading' }),
});
