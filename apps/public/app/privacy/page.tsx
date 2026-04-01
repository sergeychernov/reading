import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Privacy Policy — Reading',
	description: 'How Reading handles personal data and analytics.',
};

export default function PrivacyPage() {
	return (
		<main className='home'>
			<article>
				<h1>Privacy Policy</h1>
				<p className='home-lead'>
					Reading is a personal side project built by a single developer, provided free of charge with
					no commercial activity. Last updated: April 2026.
				</p>

				<h2>Who runs this</h2>
				<p>
					This site is maintained by an individual developer as a hobby project. There is no company,
					no paid tier, and no advertising. If you need to get in touch, please use the contact
					information published on this site.
				</p>

				<h2>Analytics</h2>
				<p>
					To understand how the site is used and improve it, we use{' '}
					<a href='https://vercel.com/docs/analytics' target='_blank' rel='noopener noreferrer'>
						Vercel Web Analytics
					</a>
					. This collects aggregated, anonymous data such as page views and referrers. No personal
					profiles are built and no data is sold.
				</p>
				<p>
					If you see a consent banner, analytics loads only after you click &quot;Accept
					analytics&quot;. You can withdraw at any time by clearing this site&apos;s data in your
					browser — the banner will reappear on your next visit. If you are not shown a banner,
					analytics is active by default (your region does not require prior consent for this type
					of anonymous measurement).
				</p>

				<h2>Server logs</h2>
				<p>
					The hosting provider (Vercel) may collect standard server logs (IP addresses, request
					timestamps) as part of operating the infrastructure. These are outside our direct control;
					see{' '}
					<a href='https://vercel.com/legal/privacy-policy' target='_blank' rel='noopener noreferrer'>
						Vercel&apos;s Privacy Policy
					</a>{' '}
					for details.
				</p>

				<h2>Authentication</h2>
				<p>
					If you sign in, we store the minimum data required to identify your account (for example
					an email address or OAuth provider identifier) so that your saved content is accessible
					across sessions. This data is stored in a private database and is not shared with third
					parties.
				</p>

				<h2>Your rights</h2>
				<p>
					Depending on where you live you may have the right to access, correct, or delete your
					personal data. Because this is a hobby project with no formal legal entity, please reach
					out directly and requests will be handled on a best-effort basis.
				</p>

				<p>
					<Link href='/' className='home-primary-link'>
						Back to home
					</Link>
				</p>
			</article>
		</main>
	);
}
