"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEpub = uploadEpub;
exports.downloadEpub = downloadEpub;
exports.uploadCoverImage = uploadCoverImage;
exports.deleteBlob = deleteBlob;
const blob_1 = require("@vercel/blob");
async function uploadEpub(bookId, fileBuffer) {
    const blob = await (0, blob_1.put)(`books/${bookId}/src.epub`, fileBuffer, {
        access: 'private',
        contentType: 'application/epub+zip',
    });
    return blob.url;
}
/**
 * Downloads an EPUB from private Vercel Blob storage using Bearer auth.
 * Requires `BLOB_READ_WRITE_TOKEN` in the environment.
 */
async function downloadEpub(url) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
        throw new Error('BLOB_READ_WRITE_TOKEN is not set');
    }
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch EPUB: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
async function uploadCoverImage(bookId, imageBuffer, contentType) {
    const blob = await (0, blob_1.put)(`covers/${bookId}`, imageBuffer, {
        access: 'private',
        contentType,
    });
    return blob.url;
}
async function deleteBlob(url) {
    await (0, blob_1.del)(url);
}
