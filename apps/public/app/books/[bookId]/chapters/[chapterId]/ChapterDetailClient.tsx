'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { ReprocessButton } from '../../../../components/ReprocessButton';
import { LanguageItemTabs } from '../../../../components/LanguageItemTabs';

interface ChapterDetailClientProps {
	bookId: string;
	chapterId: string;
	chapterIndex: number;
	chapterTitle: string;
	textPreview: string | null;
	summary: string | null;
}

export function ChapterDetailClient({
	bookId,
	chapterId,
	chapterIndex,
	chapterTitle,
	textPreview,
	summary,
}: ChapterDetailClientProps) {
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	return (
		<>
			<Box display='flex' alignItems='center' justifyContent='space-between' mb={1}>
				<Typography variant='h4' component='h1'>
					{chapterIndex + 1}. {chapterTitle}
					{textPreview && (
						<Typography component='span' variant='h5' color='text.secondary' sx={{ fontWeight: 400, ml: 0.5 }}>
							— {textPreview}
						</Typography>
					)}
				</Typography>
				<ReprocessButton
					bookId={bookId}
					chapterId={chapterId}
					onDone={() => setRefreshTrigger((k) => k + 1)}
				/>
			</Box>

			{summary && (
				<Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
					<Typography variant="subtitle2" gutterBottom>
						Chapter Summary
					</Typography>
					<Typography variant="body1">
						{summary}
					</Typography>
				</Paper>
			)}

			<Divider sx={{ my: 3 }} />

			<Typography variant="h5" gutterBottom>
				Language Items
			</Typography>

			<LanguageItemTabs
				chapterId={chapterId}
				bookId={bookId}
				refreshTrigger={refreshTrigger}
			/>
		</>
	);
}
