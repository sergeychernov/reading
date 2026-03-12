"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeContentHash = computeContentHash;
const crypto_1 = require("crypto");
/** Returns the SHA-256 hex digest of the given buffer. */
function computeContentHash(buffer) {
    return (0, crypto_1.createHash)('sha256').update(buffer).digest('hex');
}
