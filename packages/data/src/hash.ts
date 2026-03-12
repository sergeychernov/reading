import { createHash } from 'crypto';

/** Returns the SHA-256 hex digest of the given buffer. */
export function computeContentHash(buffer: Buffer): string {
	return createHash('sha256').update(buffer).digest('hex');
}
