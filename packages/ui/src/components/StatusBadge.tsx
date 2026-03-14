import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';

type Status = 'uploading' | 'uploaded' | 'parsing' | 'extracting' | 'completed' | 'failed' | 'pending';

interface StatusBadgeProps {
	status: Status;
}

const statusConfig: Record<Status, { label: string; color: ChipProps['color'] }> = {
	uploading: { label: 'Uploading', color: 'info' },
	uploaded: { label: 'Uploaded', color: 'info' },
	parsing: { label: 'Parsing', color: 'info' },
	extracting: { label: 'Extracting', color: 'warning' },
	completed: { label: 'Completed', color: 'success' },
	failed: { label: 'Failed', color: 'error' },
	pending: { label: 'Pending', color: 'default' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
	const config = statusConfig[status] ?? statusConfig.pending;

	return (
		<Chip
			label={config.label}
			color={config.color}
			size="small"
			variant="outlined"
		/>
	);
}
