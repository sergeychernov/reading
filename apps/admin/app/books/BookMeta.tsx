'use client';

import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import type { SerializedBook } from '@reading/data';

const COVER_MAX_HEIGHT_PX = 512;

function MetaRow({ label, value }: { label: string; value: string | null }) {
	const v = value ?? '—';
	return (
		<TableRow>
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
		<Box sx={{ py: 1, px: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
			<TableContainer component={Paper} variant='outlined' sx={{ maxWidth: 720, flexShrink: 0 }}>
				<Table size='small'>
					<TableBody>
						<MetaRow label='_id' value={book._id} />
						<MetaRow label='title' value={book.title} />
						<MetaRow label='author' value={book.author} />
						<MetaRow label='description' value={book.description || null} />
						<MetaRow label='coverImageUrl' value={book.coverImageUrl} />
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
			{book.coverImageUrl && (
				<Box sx={{ flex: 1, minWidth: 0, maxHeight: COVER_MAX_HEIGHT_PX }}>
					<Paper
						variant='outlined'
						sx={{
							maxHeight: COVER_MAX_HEIGHT_PX,
							overflow: 'hidden',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Box
							component='img'
							src={`/api/books/${book._id}/cover`}
							alt={book.title}
							loading='lazy'
							sx={{
								maxWidth: '100%',
								maxHeight: COVER_MAX_HEIGHT_PX,
								width: 'auto',
								height: 'auto',
								objectFit: 'contain',
								display: 'block',
							}}
						/>
					</Paper>
				</Box>
			)}
		</Box>
	);
}
