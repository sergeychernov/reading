'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Box,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { SideMenu as UiSideMenu, type NavItem } from '@reading/ui';

const DRAWER_WIDTH = 240;

const NAV_ITEMS: NavItem[] = [
	{
		label: 'LLM Config',
		href: '/',
		icon: <SmartToyOutlinedIcon />,
	},
	{
		label: 'Users',
		href: '/users',
		icon: <PeopleOutlinedIcon />,
	},
	{
		label: 'Books',
		href: '/books',
		icon: <MenuBookOutlinedIcon />,
	},
];

async function handleLogout(): Promise<void> {
	try {
		await fetch('/api/auth/logout', {
			headers: { 'Authorization': 'Basic invalid' },
		});
	} catch {
		// ignore network errors — the browser will show the login dialog
	}
	window.location.href = '/api/auth/logout';
}

export function SideMenu() {
	const pathname = usePathname();

	const activeHref = pathname === '/'
		? '/'
		: NAV_ITEMS.find((item) => item.href !== '/' && pathname.startsWith(item.href ?? ''))?.href;

	return (
		<UiSideMenu
			items={NAV_ITEMS}
			open={true}
			onClose={() => {}}
			variant='permanent'
			drawerWidth={DRAWER_WIDTH}
			activeHref={activeHref}

			header={(
				<Typography variant='subtitle1' fontWeight={700} letterSpacing={0.5}>
					Reading Admin
				</Typography>
			)}
			footer={(
				<Box>
					<ListItemButton
						onClick={handleLogout}
						sx={{ borderRadius: 1, color: 'rgba(255,255,255,0.85)' }}
					>
						<ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
							<LogoutOutlinedIcon />
						</ListItemIcon>
						<ListItemText primary='Logout' />
					</ListItemButton>
				</Box>
			)}
		/>
	);
}
