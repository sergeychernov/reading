'use client';

import { useState } from 'react';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Button } from '@mui/material';
import { AdminPageLayout, PageHeader } from '@reading/ui';
import { BooksClient } from './BooksClient';

export default function BooksPage() {
	const [refreshToken, setRefreshToken] = useState(0);

	return (
		<AdminPageLayout maxWidth='xl'>
			<PageHeader
				title='Books'
				subtitle='All books from the library with full metadata'
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
			<BooksClient refreshToken={refreshToken} />
		</AdminPageLayout>
	);
}
