import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	transpilePackages: ['@reading/ui'],
	// @reading/jobs is not transpiled so the app loads it from dist at runtime.
	// After `yarn workspace @reading/jobs build` + restart dev server, the new job code is used.

	// @storyteller-platform/epub uses yauzl-promise → @node-rs/crc32 (native Rust addon).
	// Native bindings cannot be bundled by Turbopack — must be loaded by Node.js at runtime.
	serverExternalPackages: [
		'@storyteller-platform/epub',
		'yauzl-promise',
		'@node-rs/crc32',
	],
};

export default nextConfig;
