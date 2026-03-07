'use client';

import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { StatusBadge } from '@reading/ui';

interface BookCardProps {
	id: string;
	title: string;
	author: string;
	chapterCount: number;
	processingStatus: string;
}

export function BookCard({
	id,
	title,
	author,
	chapterCount,
	processingStatus,
}: BookCardProps) {
	const router = useRouter();

	return (
		<Card variant="outlined">
			<CardActionArea onClick={() => router.push(`/books/${id}`)}>
				<CardContent>
					<Typography variant="h6" component="div" noWrap>
						{title}
					</Typography>
					<Typography variant="body2" color="text.secondary" gutterBottom>
						{author}
					</Typography>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
						<Typography variant="caption" color="text.secondary">
							{chapterCount} chapters
						</Typography>
						<StatusBadge status={processingStatus as 'completed' | 'failed' | 'extracting' | 'parsing' | 'uploading' | 'pending'} />
					</Box>
				</CardContent>
			</CardActionArea>
		</Card>
	);
}
