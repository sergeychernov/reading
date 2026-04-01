import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { AppThemeProvider } from "@reading/ui";
import { CookieConsentAndAnalytics } from "./components/CookieConsentAndAnalytics";
import { NavBar } from "./components/NavBar";
import { SessionProvider } from "./components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
	title: "Reading — Book Club",
	description: "Book club app for English language learners",
};

/**
 * Countries whose residents are subject to ePrivacy / cookie consent laws.
 * EU 27 + EEA non-EU (IS, LI, NO) + UK (GB) + Switzerland (CH).
 */
const CONSENT_REQUIRED_COUNTRIES = new Set([
	'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
	'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
	'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
	'IS', 'LI', 'NO',
	'GB',
	'CH',
]);

type RootLayoutProps = {
	children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
	const headersList = await headers();
	const country = headersList.get('x-vercel-ip-country') ?? '';
	const requiresConsent = CONSENT_REQUIRED_COUNTRIES.has(country);

	return (
		<html lang="en">
			<body>
				<SessionProvider>
					<AppRouterCacheProvider>
						<AppThemeProvider>
							<NavBar />
							{children}
							<CookieConsentAndAnalytics requiresConsent={requiresConsent} />
						</AppThemeProvider>
					</AppRouterCacheProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
