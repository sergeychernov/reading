import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

interface ItemCardProps {
	term: string;
	meaning: string;
	example: string;
	category?: string;
	/** Rarity 0–10; show "?" when undefined. */
	rarity?: number;
}

export function ItemCard({ term, meaning, example, category, rarity }: ItemCardProps) {
	const rarityLabel = rarity !== undefined && rarity !== null ? String(rarity) : '?';
	return (
		<Card variant="outlined" sx={{ mb: 2 }}>
			<CardContent>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
					<Typography variant="h6" component="span">
						{term}
					</Typography>
					<Chip label={`Rarity: ${rarityLabel}`} size="small" variant="outlined" />
					{category && (
						<Chip label={category} size="small" variant="outlined" />
					)}
				</Box>
				<Typography variant="body1" sx={{ mb: 1 }}>
					{meaning}
				</Typography>
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{
						fontStyle: 'italic',
						borderLeft: '3px solid',
						borderColor: 'divider',
						pl: 2,
					}}
				>
					&ldquo;{example}&rdquo;
				</Typography>
			</CardContent>
		</Card>
	);
}
