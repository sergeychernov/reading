'use client';

import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import type { SerializedBook } from '@reading/data';

function MetaRow({ label, value }: { label: string; value: string | null }) {
	const v = value ?? '—';
	return (
		<TableRow size='small'>
			<TableCell sx={{ fontWeight: 500, width: 180 }}>{label}</TableCell>
			<TableCell>
				{v.startsWith('http') ? (
					<a href={v} target='_blank' rel='noopener noreferrer' style={{ wordBreak: 'break-all' }}>
						{v}
					</a>
				) : (
					<Typography variant='body2' sx={{ wordBreak: 'break-word' }}>
						{v}
					</Typography>
				)}
			</TableCell>
		</TableRow>
	);
}

export function BookMeta({ book }: { book: SerializedBook }) {
	return (
		<Box sx={{ py: 1, px: 2 }}>
			<TableContainer component={Paper} variant='outlined' sx={{ maxWidth: 720 }}>
				<Table size='small'>
					<TableBody>
						<MetaRow label='_id' value={book._id} />
						<MetaRow label='title' value={book.title} />
						<MetaRow label='author' value={book.author} />
						<MetaRow label='description' value={book.description || null} />
						<MetaRow label='coverImageUrl' value={book.coverImageUrl} />
						<MetaRow label='epubBlobUrl' value={book.epubBlobUrl} />
						<MetaRow label='audibleUrl' value={book.audibleUrl} />
						<MetaRow label='kindleUrl' value={book.kindleUrl} />
						<MetaRow label='chapterCount' value={String(book.chapterCount)} />
						<MetaRow label='processingStatus' value={book.processingStatus} />
						<MetaRow label='processingError' value={book.processingError} />
						<MetaRow label='createdAt' value={book.createdAt} />
						<MetaRow label='updatedAt' value={book.updatedAt} />
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}
