'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { CategoryTabs, ItemCard } from '@reading/ui';

const CATEGORIES = [
	{ value: 'idiom', label: 'Idioms' },
	{ value: 'phrasal_verb', label: 'Phrasal Verbs' },
	{ value: 'rare_word', label: 'Rare Words' },
] as const;

interface LanguageItem {
	_id: string;
	term: string;
	meaning: string;
	exampleFromBook: string;
	category: string;
}

interface LanguageItemTabsProps {
	chapterId: string;
	bookId: string;
}

export function LanguageItemTabs({ chapterId, bookId }: LanguageItemTabsProps) {
	const [activeCategory, setActiveCategory] = useState('idiom');
	const [items, setItems] = useState<LanguageItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchItems = async () => {
			setLoading(true);
			try {
				const res = await fetch(
					`/api/books/${bookId}/chapters/${chapterId}/language-items?category=${activeCategory}`,
				);
				if (res.ok) {
					const data = await res.json() as LanguageItem[];
					setItems(data);
				}
			} catch {
				setItems([]);
			} finally {
				setLoading(false);
			}
		};

		fetchItems();
	}, [chapterId, bookId, activeCategory]);

	return (
		<Box>
			<CategoryTabs
				categories={[...CATEGORIES]}
				activeCategory={activeCategory}
				onCategoryChange={setActiveCategory}
			/>

			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
					<CircularProgress />
				</Box>
			) : items.length === 0 ? (
				<Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
					No items found in this category.
				</Typography>
			) : (
				items.map((item) => (
					<ItemCard
						key={item._id}
						term={item.term}
						meaning={item.meaning}
						example={item.exampleFromBook}
					/>
				))
			)}
		</Box>
	);
}
