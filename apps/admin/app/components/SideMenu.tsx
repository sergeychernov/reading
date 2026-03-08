'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Box,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

const DRAWER_WIDTH = 240;

interface NavItem {
	label: string;
	href: string;
	icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
	{
		label: 'LLM Config',
		href: '/',
		icon: <SmartToyOutlinedIcon />,
	},
	{
		label: 'Pipeline',
		href: '/pipeline',
		icon: <TuneOutlinedIcon />,
	},
	{
		label: 'Users',
		href: '/users',
		icon: <PeopleOutlinedIcon />,
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

	return (
		<Drawer
			variant='permanent'
			sx={{
				width: DRAWER_WIDTH,
				flexShrink: 0,
				'& .MuiDrawer-paper': {
					width: DRAWER_WIDTH,
					boxSizing: 'border-box',
					borderRight: '1px solid',
					borderColor: 'divider',
					display: 'flex',
					flexDirection: 'column',
				},
			}}
		>
			<Box sx={{ px: 2.5, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
				<Typography variant='subtitle1' fontWeight={700} letterSpacing={0.5}>
					Reading Admin
				</Typography>
			</Box>

			<List disablePadding sx={{ pt: 1, flex: 1 }}>
				{NAV_ITEMS.map((item) => {
					const active = item.href === '/'
						? pathname === '/'
						: pathname.startsWith(item.href);

					return (
						<ListItem key={item.href} disablePadding>
							<ListItemButton
								component={Link}
								href={item.href}
								selected={active}
								sx={{
									mx: 1,
									borderRadius: 1,
									'&.Mui-selected': {
										bgcolor: 'primary.main',
										color: 'primary.contrastText',
										'& .MuiListItemIcon-root': {
											color: 'primary.contrastText',
										},
										'&:hover': {
											bgcolor: 'primary.dark',
										},
									},
								}}
							>
								<ListItemIcon sx={{ minWidth: 36 }}>
									{item.icon}
								</ListItemIcon>
								<ListItemText primary={item.label} />
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>

			<Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
				<ListItemButton
					onClick={handleLogout}
					sx={{ borderRadius: 1, color: 'text.secondary' }}
				>
					<ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
						<LogoutOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary='Logout' />
				</ListItemButton>
			</Box>
		</Drawer>
	);
}
