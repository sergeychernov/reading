'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { CategoryTabs, ItemCard } from '@reading/ui';
import type { MeaningTranslations } from '@reading/llm-schemas';
import type { TranslationLanguage } from '../../lib/types/user';

const CATEGORIES = [
	{ value: 'idiom', label: 'Idioms' },
	{ value: 'phrasal_verb', label: 'Phrasal Verbs' },
	{ value: 'rare_word', label: 'Rare Words' },
] as const;

interface LanguageItem {
	_id: string;
	term: string;
	meaning: MeaningTranslations | string;
	exampleFromBook: string;
	category: string;
	rarity?: number;
}

function resolveMeaning(meaning: MeaningTranslations | string, lang: TranslationLanguage): string {
	if (typeof meaning === 'string') return meaning;
	return (meaning as Record<string, string>)[lang] ?? meaning.en;
}

interface LanguageItemTabsProps {
	chapterId: string;
	bookId: string;
	/** When this value changes, language items are refetched (e.g. after reprocessing). */
	refreshTrigger?: number;
	translationLanguage?: TranslationLanguage;
	summary?: string | null;
}

export function LanguageItemTabs({
	chapterId,
	bookId,
	refreshTrigger,
	translationLanguage = 'en',
	summary,
}: LanguageItemTabsProps) {
	const [activeCategory, setActiveCategory] = useState('idiom');
	const [allItems, setAllItems] = useState<LanguageItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchItems = async () => {
			setLoading(true);
			try {
				const res = await fetch(
					`/api/books/${bookId}/chapters/${chapterId}/language-items`,
				);
				if (res.ok) {
					const data = await res.json() as LanguageItem[];
					setAllItems(data);
				} else {
					setAllItems([]);
				}
			} catch {
				setAllItems([]);
			} finally {
				setLoading(false);
			}
		};

		fetchItems();
	}, [chapterId, bookId, refreshTrigger]);

	const counts = CATEGORIES.reduce(
		(acc, cat) => {
			acc[cat.value] = allItems.filter((i) => i.category === cat.value).length;
			return acc;
		},
		{} as Record<string, number>,
	);

	const categoriesWithCounts: Array<{ value: string; label: string }> = [
		...CATEGORIES.map((cat) => ({
			value: cat.value,
			label: `${cat.label} (${counts[cat.value] ?? 0})`,
		})),
		{
			value: 'summary',
			label: 'Summary',
		},
	];

	const items = allItems
		.filter((i) => i.category === activeCategory)
		.sort((a, b) => {
			const ra = a.rarity ?? -1;
			const rb = b.rarity ?? -1;
			if (rb !== ra) return rb - ra;
			return (a.term ?? '').localeCompare(b.term ?? '');
		});

	return (
		<Box>
			<CategoryTabs
				categories={categoriesWithCounts}
				activeCategory={activeCategory}
				onCategoryChange={setActiveCategory}
				compactOnMobile
			/>

			{activeCategory === 'summary' ? (
				summary ? (
					<Typography variant='body1' sx={{ py: 3 }}>
						{summary}
					</Typography>
				) : (
					<Typography variant='body1' color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
						Summary is not available for this chapter.
					</Typography>
				)
			) : loading ? (
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
						meaning={resolveMeaning(item.meaning, translationLanguage)}
						example={item.exampleFromBook}
						rarity={item.rarity}
					/>
				))
			)}
		</Box>
	);
}
