import Link from 'next/link';

export default function HomePage() {
	return (
		<main className='home'>
			<section className='home-hero'>
				<p className='home-eyebrow'>Fully free for now</p>
				<h1>Level up your English</h1>
				<p className='home-lead'>
					<strong>Speak better faster.</strong> AI-powered English for real communication, not
					classroom drills.
				</p>
				<p>
					Train with authentic language from books, films, and TV series.
					<strong> English in the wild</strong>, not school grammar.
				</p>
				<div className='home-cta'>
					<Link href='/profile' className='home-primary-link'>
						Start Free
					</Link>
					<span>English, accelerated.</span>
				</div>
			</section>

			<section className='home-grid' aria-label='Value blocks'>
				<article className='home-card'>
					<h2>Conversational English</h2>
					<p>
						Focus on natural phrases, rhythm, and everyday patterns used by native speakers.
					</p>
				</article>
				<article className='home-card'>
					<h2>Vocabulary Growth</h2>
					<p>
						Build a practical vocabulary from real contexts, so words stick and become active.
					</p>
				</article>
				<article className='home-card'>
					<h2>System Learning</h2>
					<p>
						Learn step by step with a clear path: input, extraction, practice, and repetition.
					</p>
				</article>
				<article className='home-card'>
					<h2>AI Speed Multiplier</h2>
					<p>
						Train smarter, speak faster with AI guidance that helps you progress consistently.
					</p>
				</article>
			</section>

			<section className='home-sections' aria-label='Content sections'>
				<h2>Choose your content</h2>
				<div className='home-links'>
					<Link href='/books' className='home-link-card'>
						<strong>Books</strong>
						<span>Learn through long-form stories and rich narrative language.</span>
					</Link>
					<Link href='/series' className='home-link-card'>
						<strong>Series</strong>
						<span>Train on dynamic dialogues and modern spoken expressions.</span>
					</Link>
					<Link href='/songs' className='home-link-card'>
						<strong>Songs</strong>
						<span>Catch idioms, pronunciation patterns, and memorable phrasing.</span>
					</Link>
				</div>
			</section>
		</main>
	);
}
