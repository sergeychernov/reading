'use client';

import { useRouter } from 'next/navigation';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { StatusBadge } from '@reading/ui';

interface ChapterData {
	_id: string;
	chapterIndex: number;
	title: string;
	summary: string | null;
	textPreview: string;
	processingStatus: string;
}

interface ChapterListProps {
	bookId: string;
	chapters: ChapterData[];
}

export function ChapterList({ bookId, chapters }: ChapterListProps) {
	const router = useRouter();

	if (chapters.length === 0) {
		return (
			<Typography variant="body1" color="text.secondary">
				No chapters found.
			</Typography>
		);
	}

	return (
		<List disablePadding>
			{chapters.map((chapter) => (
				<ListItem key={chapter._id} disablePadding divider>
					<ListItemButton
						dense
						onClick={() => router.push(`/books/${bookId}/chapters/${chapter._id}`)}
					>
						<ListItemText
							disableTypography
							primary={
								<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, minWidth: 0 }}>
									<Typography variant="body2" sx={{ flexShrink: 0 }}>
										{chapter.chapterIndex + 1}. {chapter.title}
									</Typography>
									{chapter.textPreview && (
										<Typography variant="body2" color="text.secondary" noWrap sx={{ flexGrow: 1 }}>
											— {chapter.textPreview}
										</Typography>
									)}
									<StatusBadge status={chapter.processingStatus as 'completed' | 'failed' | 'extracting' | 'pending'} />
								</Box>
							}
						/>
					</ListItemButton>
				</ListItem>
			))}
		</List>
	);
}
