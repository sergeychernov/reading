"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeContentHash = exports.serializeChapter = exports.serializeBook = exports.deleteBlob = exports.uploadCoverImage = exports.downloadEpub = exports.uploadEpub = exports.getPendingChapters = exports.countChaptersByStatus = exports.updateChapterSummary = exports.updateChapterStatus = exports.insertManyChapters = exports.getChapterById = exports.getChaptersByBookId = exports.markBookFailed = exports.updateBookEpubUrl = exports.updateBookMeta = exports.updateBookChapterCount = exports.updateBookStatus = exports.insertBook = exports.getBookById = exports.getAllBooksAdmin = exports.getAllBooks = exports.withDb = exports.getDb = exports.getClientPromise = exports.DB_NAME = void 0;
// Connection
var connection_1 = require("./connection");
Object.defineProperty(exports, "DB_NAME", { enumerable: true, get: function () { return connection_1.DB_NAME; } });
Object.defineProperty(exports, "getClientPromise", { enumerable: true, get: function () { return connection_1.getClientPromise; } });
Object.defineProperty(exports, "getDb", { enumerable: true, get: function () { return connection_1.getDb; } });
Object.defineProperty(exports, "withDb", { enumerable: true, get: function () { return connection_1.withDb; } });
// Book operations
var books_1 = require("./books");
Object.defineProperty(exports, "getAllBooks", { enumerable: true, get: function () { return books_1.getAllBooks; } });
Object.defineProperty(exports, "getAllBooksAdmin", { enumerable: true, get: function () { return books_1.getAllBooksAdmin; } });
Object.defineProperty(exports, "getBookById", { enumerable: true, get: function () { return books_1.getBookById; } });
Object.defineProperty(exports, "insertBook", { enumerable: true, get: function () { return books_1.insertBook; } });
Object.defineProperty(exports, "updateBookStatus", { enumerable: true, get: function () { return books_1.updateBookStatus; } });
Object.defineProperty(exports, "updateBookChapterCount", { enumerable: true, get: function () { return books_1.updateBookChapterCount; } });
Object.defineProperty(exports, "updateBookMeta", { enumerable: true, get: function () { return books_1.updateBookMeta; } });
Object.defineProperty(exports, "updateBookEpubUrl", { enumerable: true, get: function () { return books_1.updateBookEpubUrl; } });
Object.defineProperty(exports, "markBookFailed", { enumerable: true, get: function () { return books_1.markBookFailed; } });
// Chapter operations
var chapters_1 = require("./chapters");
Object.defineProperty(exports, "getChaptersByBookId", { enumerable: true, get: function () { return chapters_1.getChaptersByBookId; } });
Object.defineProperty(exports, "getChapterById", { enumerable: true, get: function () { return chapters_1.getChapterById; } });
Object.defineProperty(exports, "insertManyChapters", { enumerable: true, get: function () { return chapters_1.insertManyChapters; } });
Object.defineProperty(exports, "updateChapterStatus", { enumerable: true, get: function () { return chapters_1.updateChapterStatus; } });
Object.defineProperty(exports, "updateChapterSummary", { enumerable: true, get: function () { return chapters_1.updateChapterSummary; } });
Object.defineProperty(exports, "countChaptersByStatus", { enumerable: true, get: function () { return chapters_1.countChaptersByStatus; } });
Object.defineProperty(exports, "getPendingChapters", { enumerable: true, get: function () { return chapters_1.getPendingChapters; } });
// Blob operations
var blob_1 = require("./blob");
Object.defineProperty(exports, "uploadEpub", { enumerable: true, get: function () { return blob_1.uploadEpub; } });
Object.defineProperty(exports, "downloadEpub", { enumerable: true, get: function () { return blob_1.downloadEpub; } });
Object.defineProperty(exports, "uploadCoverImage", { enumerable: true, get: function () { return blob_1.uploadCoverImage; } });
Object.defineProperty(exports, "deleteBlob", { enumerable: true, get: function () { return blob_1.deleteBlob; } });
// Serialization
var serialization_1 = require("./serialization");
Object.defineProperty(exports, "serializeBook", { enumerable: true, get: function () { return serialization_1.serializeBook; } });
Object.defineProperty(exports, "serializeChapter", { enumerable: true, get: function () { return serialization_1.serializeChapter; } });
// Utilities
var hash_1 = require("./hash");
Object.defineProperty(exports, "computeContentHash", { enumerable: true, get: function () { return hash_1.computeContentHash; } });
