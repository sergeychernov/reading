'use client';

import { useState } from 'react';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Button } from '@mui/material';
import { AdminPageLayout, PageHeader } from '@reading/ui';
import { UsersClient } from './UsersClient';

export default function UsersPage() {
	const [refreshToken, setRefreshToken] = useState(0);

	return (
		<AdminPageLayout maxWidth='xl'>
			<PageHeader
				title='Users'
				subtitle='Manage user accounts and subscriptions'
			>
				<Button
					size='small'
					variant='outlined'
					startIcon={<RefreshOutlinedIcon />}
					onClick={() => setRefreshToken((value) => value + 1)}
				>
					Refresh
				</Button>
			</PageHeader>
			<UsersClient refreshToken={refreshToken} />
		</AdminPageLayout>
	);
}
