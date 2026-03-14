import type { PropsWithChildren, ReactNode } from 'react';
import {
	Box,
	Container,
	Typography,
	type SxProps,
	type Theme,
} from '@mui/material';

interface AdminPageLayoutProps extends PropsWithChildren {
	maxWidth?: 'sm' | 'lg' | 'xl';
}

interface AdminPageSectionProps extends PropsWithChildren {
	sx?: SxProps<Theme>;
}

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	sx?: SxProps<Theme>;
	children?: ReactNode;
}

export function AdminPageLayout({
	children,
	maxWidth = 'xl',
}: AdminPageLayoutProps) {
	return (
		<Container maxWidth={maxWidth} sx={{ py: 6 }}>
			{children}
		</Container>
	);
}

export function PageHeader({ title, subtitle, sx, children }: PageHeaderProps) {
	return (
		<Box
			mb={4}
			display='flex'
			flexDirection={{ xs: 'column', md: 'row' }}
			alignItems={{ xs: 'flex-start', md: 'center' }}
			justifyContent='space-between'
			gap={2}
			sx={sx}
		>
			<Box
				display='flex'
				flexDirection={{ xs: 'column', md: 'row' }}
				alignItems={{ xs: 'flex-start', md: 'baseline' }}
				gap={{ xs: 0, md: 2 }}
			>
				<Typography
					variant='h4'
					component='h1'
					sx={{ mb: { xs: 0.5, md: 0 } }}
				>
					{title}
				</Typography>
				{subtitle && (
					<Typography variant='body2' color='text.secondary'>
						{subtitle}
					</Typography>
				)}
			</Box>
			{children && (
				<Box display='flex' alignItems='center' gap={1} sx={{ ml: { md: 3 } }}>
					{children}
				</Box>
			)}
		</Box>
	);
}

export function AdminPageContent({ children, sx }: AdminPageSectionProps) {
	return <Box sx={sx}>{children}</Box>;
}
