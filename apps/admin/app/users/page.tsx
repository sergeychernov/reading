import { Container, Typography, Box } from '@mui/material';
import { UsersClient } from './UsersClient';

export default function UsersPage() {
	return (
		<Container maxWidth='lg' sx={{ py: 6 }}>
			<Box mb={4}>
				<Typography variant='h4' component='h1' gutterBottom>
					Users
				</Typography>
				<Typography variant='body2' color='text.secondary'>
					Manage user accounts and subscriptions
				</Typography>
			</Box>
			<UsersClient />
		</Container>
	);
}
