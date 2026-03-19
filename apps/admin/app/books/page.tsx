'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { Alert, Box, Button, Snackbar } from '@mui/material';
import { AdminPageLayout, PageHeader } from '@reading/ui';
import { BooksClient } from './BooksClient';

export default function BooksPage() {
	const [refreshToken, setRefreshToken] = useState(0);
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [uploadSuccessOpen, setUploadSuccessOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0] ?? null;
		event.target.value = '';

		if (!file) {
			return;
		}

		setUploading(true);
		setUploadError(null);
		setUploadSuccessOpen(false);

		try {
			const formData = new FormData();
			formData.append('epub', file);

			const res = await fetch('/api/books', {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) {
				const data = (await res.json()) as { error?: string };
				throw new Error(data.error ?? `HTTP ${res.status}`);
			}

			setUploadSuccessOpen(true);
			setRefreshToken((value) => value + 1);
		} catch (error) {
			setUploadError(
				error instanceof Error ? error.message : 'Failed to upload EPUB',
			);
		} finally {
			setUploading(false);
		}
	};

	return (
		<AdminPageLayout maxWidth='xl'>
			<PageHeader
				title='Books'
				subtitle='All books from the library with full metadata'
			>
				<Box sx={{ display: 'flex', gap: 1 }}>
					<input
						ref={fileInputRef}
						type='file'
						accept='.epub,application/epub+zip'
						onChange={handleFileChange}
						hidden
					/>
					<Button
						size='small'
						variant='contained'
						startIcon={<UploadFileOutlinedIcon />}
						disabled={uploading}
						onClick={handleUploadClick}
					>
						{uploading ? 'Uploading...' : 'Upload'}
					</Button>
					<Button
						size='small'
						variant='outlined'
						startIcon={<RefreshOutlinedIcon />}
						disabled={uploading}
						onClick={() => setRefreshToken((value) => value + 1)}
					>
						Refresh
					</Button>
				</Box>
			</PageHeader>
			{uploadError ? (
				<Alert severity='error' sx={{ mb: 2 }}>
					Failed to upload book: {uploadError}
				</Alert>
			) : null}
			<BooksClient refreshToken={refreshToken} />
			<Snackbar
				open={uploadSuccessOpen}
				autoHideDuration={3000}
				onClose={() => setUploadSuccessOpen(false)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			>
				<Alert
					severity='success'
					variant='filled'
					onClose={() => setUploadSuccessOpen(false)}
				>
					Book uploaded with status uploaded.
				</Alert>
			</Snackbar>
		</AdminPageLayout>
	);
}
