import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { StatusBadge } from '@reading/ui';

interface BookHeaderProps {
	title: string;
	author: string;
	description: string;
	processingStatus: string;
	/** When true, the badge shows failure even if `processingStatus` is e.g. `completed`. */
	failed?: boolean;
	audibleUrl: string | null;
	kindleUrl: string | null;
}

export function BookHeader({
	title,
	author,
	description,
	processingStatus,
	failed = false,
	audibleUrl,
	kindleUrl,
}: BookHeaderProps) {
	const badgeStatus = failed ? 'failed' : processingStatus;

	return (
		<Box sx={{ mb: 4 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
				<Typography variant="h4" component="h1">
					{title}
				</Typography>
				<StatusBadge
					status={
						badgeStatus as
							| 'completed'
							| 'failed'
							| 'extracting'
							| 'parsing'
							| 'pending'
							| 'uploading'
							| 'uploaded'
							| 'parsed'
					}
				/>
			</Box>
			<Typography variant="h6" color="text.secondary" gutterBottom>
				{author}
			</Typography>
			{description && (
				<Typography variant="body1" sx={{ mb: 2 }}>
					{description}
				</Typography>
			)}
			<Box sx={{ display: 'flex', gap: 2 }}>
				{audibleUrl && (
					<Button
						variant="outlined"
						href={audibleUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						Audible
					</Button>
				)}
				{kindleUrl && (
					<Button
						variant="outlined"
						href={kindleUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						Kindle
					</Button>
				)}
			</Box>
		</Box>
	);
}
