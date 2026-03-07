import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

interface ProgressIndicatorProps {
	completed: number;
	total: number;
	failed?: number;
	label?: string;
}

export function ProgressIndicator({
	completed,
	total,
	failed = 0,
	label,
}: ProgressIndicatorProps) {
	const progress = total > 0 ? ((completed + failed) / total) * 100 : 0;

	return (
		<Box sx={{ width: '100%' }}>
			{label && (
				<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
					{label}
				</Typography>
			)}
			<LinearProgress
				variant="determinate"
				value={progress}
				color={failed > 0 ? 'warning' : 'primary'}
				sx={{ height: 8, borderRadius: 4 }}
			/>
			<Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
				{completed} / {total} chapters processed
				{failed > 0 && ` (${failed} failed)`}
			</Typography>
		</Box>
	);
}
