import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { AppThemeProvider } from '@reading/ui';
import { Box } from '@mui/material';
import { SideMenu } from './components/SideMenu';
import './globals.css';

export const metadata: Metadata = {
	title: 'Reading — Admin',
	description: 'Administration panel for the Reading app',
};

interface RootLayoutProps {
	children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang='en'>
			<body>
				<AppRouterCacheProvider>
					<AppThemeProvider>
						<Box sx={{ display: 'flex', minHeight: '100vh' }}>
							<SideMenu />
							<Box
								component='main'
								sx={{ flex: 1, overflow: 'auto' }}
							>
								{children}
							</Box>
						</Box>
					</AppThemeProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
