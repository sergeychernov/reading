import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function SeriesPage() {
	return (
		<Container maxWidth='md' sx={{ py: 6 }}>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				<Typography variant='h3' component='h1'>
					Series
				</Typography>
				<Typography variant='body1' color='text.secondary'>
					This section is in development.
				</Typography>
				<Typography variant='body1' color='text.secondary'>
					Soon you will be able to learn English with vocabulary from TV series.
				</Typography>
			</Box>
		</Container>
	);
}
