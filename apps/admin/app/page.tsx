import { Box } from '@mui/material';
import { AdminPageLayout, PageHeader } from '@reading/ui';
import { LlmConfigForm } from './components/LlmConfigForm';
import { PipelineSettingsClient } from './components/PipelineSettingsClient/index';

export default function AdminPage() {
	return (
		<AdminPageLayout maxWidth='xl'>
			<PageHeader
				title='LLM Config'
				subtitle='Language model adapter configuration for chapter extraction'
			/>
			<LlmConfigForm />
			<Box mt={6}>
				<PipelineSettingsClient />
			</Box>
		</AdminPageLayout>
	);
}
