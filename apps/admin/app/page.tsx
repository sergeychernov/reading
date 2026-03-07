import { Container, Typography, Box } from '@mui/material';
import { LlmConfigForm } from './components/LlmConfigForm';

export default function AdminPage() {
	return (
		<Container maxWidth='sm' sx={{ py: 6 }}>
			<Box mb={4}>
				<Typography variant='h4' component='h1' gutterBottom>
					LLM Config
				</Typography>
				<Typography variant='body2' color='text.secondary'>
					Language model adapter configuration for chapter extraction
				</Typography>
			</Box>
			<LlmConfigForm />
		</Container>
	);
}
