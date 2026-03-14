export interface CreateUploadedBookParams {
	fileBuffer: Buffer;
	fileName: string;
	audibleUrl: string | null;
	kindleUrl: string | null;
}

export interface CreateUploadedBookResult {
	bookId: string;
	epubBlobUrl: string;
}

export interface ValidationResult {
	valid: boolean;
	error?: string;
}
