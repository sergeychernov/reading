'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import { AppLogo, HeaderMenu, BurgerMenu } from '@reading/ui';
import type { NavItem, RenderLinkFn } from '@reading/ui';
import { useSession } from 'next-auth/react';
import { AuthButton } from './AuthButton';

const BASE_NAV_ITEMS: NavItem[] = [
	{ label: 'Home', href: '/' },
	{ label: 'Books', href: '/books' },
	{ label: 'Upload', href: '/upload' },
];

const PROFILE_NAV_ITEM: NavItem = { label: 'Profile', href: '/profile' };

const renderLink: RenderLinkFn = (href: string, children: ReactNode) => (
	<Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
		{children}
	</Link>
);

const logoIcon = (
	<Link href='/' style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
		<AppLogo size={36} />
	</Link>
);

export function NavBar() {
	const { data: session } = useSession();
	const navItems: NavItem[] = session?.user
		? [...BASE_NAV_ITEMS, PROFILE_NAV_ITEM]
		: BASE_NAV_ITEMS;

	return (
		<AppBar position='static' elevation={0} sx={{ bgcolor: '#0f172a' }}>
			<Toolbar>
				{/* Mobile: burger menu visible below md breakpoint */}
				<Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
					<BurgerMenu items={navItems} renderLink={renderLink} topOffset={{ xs: 56, sm: 64 }} />
					<Link href='/' style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
						<AppLogo size={36} />
					</Link>
				</Box>

				{/* Desktop: header menu visible at md and above */}
				<Box sx={{ display: { xs: 'none', md: 'flex' }, width: '100%', alignItems: 'center' }}>
					<HeaderMenu items={navItems} logo={logoIcon} renderLink={renderLink} />
					<Box sx={{ ml: 'auto' }}>
						<AuthButton />
					</Box>
				</Box>

				{/* Mobile: auth button */}
				<Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}>
					<AuthButton />
				</Box>
			</Toolbar>
		</AppBar>
	);
}
