import { Container, Typography, Box } from '@mui/material';
import { PipelineSettingsClient } from './PipelineSettingsClient';

export default function PipelinePage() {
	return (
		<Container maxWidth='lg' sx={{ py: 6 }}>
			<Box mb={4}>
				<Typography variant='h4' component='h1' gutterBottom>
					Pipeline
				</Typography>
				<Typography variant='body2' color='text.secondary'>
					Manage chapter extraction pipelines
				</Typography>
			</Box>
			<PipelineSettingsClient />
		</Container>
	);
}
