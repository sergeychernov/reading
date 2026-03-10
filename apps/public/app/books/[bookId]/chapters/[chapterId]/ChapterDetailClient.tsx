'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';
import { ReprocessButton } from '../../../../components/ReprocessButton';
import { LanguageItemTabs } from '../../../../components/LanguageItemTabs';
import type { TranslationLanguage } from '../../../../../lib/types/user';

interface ChapterDetailClientProps {
	bookId: string;
	bookTitle: string;
	chapterId: string;
	chapterIndex: number;
	chapterTitle: string;
	textPreview: string | null;
	nextChapterId: string | null;
	summary: string | null;
}

export function ChapterDetailClient({
	bookId,
	bookTitle,
	chapterId,
	chapterIndex,
	chapterTitle,
	textPreview,
	nextChapterId,
	summary,
}: ChapterDetailClientProps) {
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [translationLanguage, setTranslationLanguage] = useState<TranslationLanguage>('en');

	useEffect(() => {
		fetch('/api/profile')
			.then((res) => (res.ok ? (res.json() as Promise<{ translationLanguage: TranslationLanguage | null }>) : null))
			.then((data) => {
				if (data?.translationLanguage) setTranslationLanguage(data.translationLanguage);
			})
			.catch(() => {});
	}, []);

	return (
		<>
			<Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
				<Link href={`/books/${bookId}`}>
					<Button startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none' }}>
						<Typography component='span' sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
							<Typography component='span'>Back</Typography>
							<Typography component='span' variant='caption' color='text.secondary'>
								{bookTitle}
							</Typography>
						</Typography>
					</Button>
				</Link>
				<ReprocessButton bookId={bookId} chapterId={chapterId} onDone={() => setRefreshTrigger((k) => k + 1)} />
			</Box>
			<Box display='flex' alignItems='flex-start' justifyContent='space-between' gap={1} mb={1}>
				<Typography
					variant='h4'
					component='h1'
					sx={{ flex: 1, minWidth: 0, fontSize: { xs: '1.25rem', sm: '2.125rem' }, lineHeight: { xs: 1.2, sm: 1.3 } }}
				>
					{chapterIndex + 1}. {chapterTitle}
					{textPreview && (
						<Typography
							component='span'
							variant='h5'
							color='text.secondary'
							sx={{ fontWeight: 400, ml: 0.5, fontSize: { xs: '1rem', sm: '1.5rem' } }}
						>
							— {textPreview}
						</Typography>
					)}
				</Typography>
				{nextChapterId && (
					<IconButton
						component={Link}
						href={`/books/${bookId}/chapters/${nextChapterId}`}
						size='small'
						aria-label='Go to next chapter'
						sx={{ flexShrink: 0, mt: 0.25 }}
					>
						<ArrowForwardIcon fontSize='small' />
					</IconButton>
				)}
			</Box>

			<LanguageItemTabs
				chapterId={chapterId}
				bookId={bookId}
				refreshTrigger={refreshTrigger}
				translationLanguage={translationLanguage}
				summary={summary}
			/>
		</>
	);
}
