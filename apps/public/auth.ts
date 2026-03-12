import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { getClientPromise } from '@reading/data';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	adapter: MongoDBAdapter(getClientPromise(), { databaseName: 'reading' }),
});
