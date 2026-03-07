const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_TYPES = ['application/epub+zip'];

interface ValidationResult {
	valid: boolean;
	error?: string;
}

export function validateEpubFile(file: File): ValidationResult {
	if (!file) {
		return { valid: false, error: 'No file provided' };
	}

	if (file.size > MAX_FILE_SIZE) {
		return { valid: false, error: 'File size exceeds 50MB limit' };
	}

	if (!file.name.endsWith('.epub')) {
		return { valid: false, error: 'File must be an EPUB (.epub)' };
	}

	// Content type check (may not always be set correctly by browsers)
	if (file.type && !ALLOWED_TYPES.includes(file.type)) {
		// Allow empty type as some browsers don't set it for epub
		if (file.type !== '') {
			return { valid: false, error: 'Invalid file type. Must be an EPUB file' };
		}
	}

	return { valid: true };
}
