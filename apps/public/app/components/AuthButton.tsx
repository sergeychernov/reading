'use client';

import Button from '@mui/material/Button';
import { signIn, signOut, useSession } from 'next-auth/react';

export function AuthButton() {
	const { data: session } = useSession();

	if (session?.user) {
		return (
			<Button
				color="inherit"
				onClick={() => signOut()}
				size="small"
			>
				Sign Out
			</Button>
		);
	}

	return (
		<Button
			color="inherit"
			onClick={() => signIn('google')}
			size="small"
		>
			Sign In
		</Button>
	);
}
