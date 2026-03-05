import Container from '@mui/material/Container';
import { EpubUploadForm } from '../components/EpubUploadForm';

export default function UploadPage() {
	return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			<EpubUploadForm />
		</Container>
	);
}
