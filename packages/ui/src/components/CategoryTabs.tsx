'use client';

import { type SyntheticEvent } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

interface CategoryTabsProps {
	categories: Array<{ value: string; label: string }>;
	activeCategory: string;
	onCategoryChange: (category: string) => void;
	compactOnMobile?: boolean;
}

export function CategoryTabs({
	categories,
	activeCategory,
	onCategoryChange,
	compactOnMobile = false,
}: CategoryTabsProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const handleChange = (_event: SyntheticEvent, newValue: string) => {
		onCategoryChange(newValue);
	};

	const useCompactMobileLayout = compactOnMobile && isMobile;

	return (
		<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
			<Tabs
				value={activeCategory}
				onChange={handleChange}
				variant={useCompactMobileLayout ? 'fullWidth' : 'scrollable'}
				scrollButtons={useCompactMobileLayout ? false : 'auto'}
			>
				{categories.map((cat) => (
					<Tab
						key={cat.value}
						value={cat.value}
						label={cat.label}
						wrapped={useCompactMobileLayout}
						sx={
							useCompactMobileLayout
								? {
									minWidth: 0,
									px: 0.5,
									py: 0.75,
									fontSize: '0.8rem',
									lineHeight: 1.2,
								}
								: undefined
						}
					/>
				))}
			</Tabs>
		</Box>
	);
}
