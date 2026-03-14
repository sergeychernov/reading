import type { Meta, StoryObj } from '@storybook/react';
import { Button, Paper, Typography } from '@mui/material';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import {
	AdminPageContent,
	AdminPageLayout,
	PageHeader,
} from './index';

const meta = {
	title: 'Layouts/Admin',
	component: AdminPageLayout,
	tags: ['autodocs'],
} satisfies Meta<typeof AdminPageLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BooksPage: Story = {
	render: () => (
		<AdminPageLayout maxWidth='xl'>
			<PageHeader
				title='Books'
				subtitle='All books from the library with full metadata'
			>
				<Button
					size='small'
					variant='outlined'
					startIcon={<RefreshOutlinedIcon />}
				>
					Refresh
				</Button>
			</PageHeader>
			<AdminPageContent>
				<Paper variant='outlined' sx={{ p: 3 }}>
					<Typography variant='body2'>
						Main content container example
					</Typography>
				</Paper>
			</AdminPageContent>
		</AdminPageLayout>
	),
};
