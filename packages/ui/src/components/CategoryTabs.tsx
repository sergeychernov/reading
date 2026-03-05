'use client';

import { type SyntheticEvent } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

interface CategoryTabsProps {
	categories: Array<{ value: string; label: string }>;
	activeCategory: string;
	onCategoryChange: (category: string) => void;
}

export function CategoryTabs({
	categories,
	activeCategory,
	onCategoryChange,
}: CategoryTabsProps) {
	const handleChange = (_event: SyntheticEvent, newValue: string) => {
		onCategoryChange(newValue);
	};

	return (
		<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
			<Tabs
				value={activeCategory}
				onChange={handleChange}
				variant="scrollable"
				scrollButtons="auto"
			>
				{categories.map((cat) => (
					<Tab key={cat.value} value={cat.value} label={cat.label} />
				))}
			</Tabs>
		</Box>
	);
}
