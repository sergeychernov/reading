import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	transpilePackages: ['@reading/ui'],
	// @reading/jobs is not transpiled so the app loads it from dist at runtime.
	// After `yarn workspace @reading/jobs build` + restart dev server, the new job code is used.
};

export default nextConfig;
