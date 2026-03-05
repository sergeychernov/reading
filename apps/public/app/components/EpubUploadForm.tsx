'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { FileUploadDropzone } from '@reading/ui';

export function EpubUploadForm() {
	const router = useRouter();
	const [file, setFile] = useState<File | null>(null);
	const [audibleUrl, setAudibleUrl] = useState('');
	const [kindleUrl, setKindleUrl] = useState('');
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file) {
			setError('Please select an EPUB file');
			return;
		}

		setUploading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append('epub', file);
			if (audibleUrl) formData.append('audibleUrl', audibleUrl);
			if (kindleUrl) formData.append('kindleUrl', kindleUrl);

			const res = await fetch('/api/books', {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) {
				const data = await res.json() as { error?: string };
				throw new Error(data.error ?? 'Upload failed');
			}

			const data = await res.json() as { bookId: string };
			router.push(`/books/${data.bookId}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Upload failed');
		} finally {
			setUploading(false);
		}
	};

	return (
		<Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
			<Typography variant="h5" gutterBottom>
				Upload a Book
			</Typography>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{error}
				</Alert>
			)}

			<Box sx={{ mb: 3 }}>
				<FileUploadDropzone
					accept=".epub"
					maxSizeMb={50}
					onFileSelected={setFile}
					disabled={uploading}
				/>
			</Box>

			<TextField
				fullWidth
				label="Audible URL"
				placeholder="https://www.audible.com/..."
				value={audibleUrl}
				onChange={(e) => setAudibleUrl(e.target.value)}
				disabled={uploading}
				sx={{ mb: 2 }}
			/>

			<TextField
				fullWidth
				label="Kindle URL"
				placeholder="https://www.amazon.com/..."
				value={kindleUrl}
				onChange={(e) => setKindleUrl(e.target.value)}
				disabled={uploading}
				sx={{ mb: 3 }}
			/>

			<Button
				type="submit"
				variant="contained"
				size="large"
				fullWidth
				disabled={!file || uploading}
				startIcon={uploading ? <CircularProgress size={20} /> : undefined}
			>
				{uploading ? 'Uploading...' : 'Upload Book'}
			</Button>
		</Box>
	);
}
