import type { Metadata } from 'next';
import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import { ProfileClient } from './ProfileClient';

export const metadata: Metadata = {
	title: 'Profile — Reading',
};

export default async function ProfilePage() {
	const session = await auth();
	if (!session?.user) {
		redirect('/');
	}

	return (
		<ProfileClient
			userName={session.user.name ?? ''}
			userEmail={session.user.email ?? ''}
			userImage={session.user.image ?? null}
		/>
	);
}
