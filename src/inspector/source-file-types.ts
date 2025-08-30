/**
 * Source file type definitions for inspector framework.
 */

import type ts from "typescript";

/**
 * Represents a parsed source file with its TypeScript AST and metadata.
 */
export interface ParsedSourceFile {
	file: ts.SourceFile;
	metadata: ParsedSourceFileMetadata;
}

/**
 * Metadata about a source file.
 */
export interface ParsedSourceFileMetadata {
	/**
	 * The type of the source file.
	 *
	 * Detected from the file name.
	 */
	fileType: FileType;

	/**
	 * Indicates if the file is a declaration file (typically `*.d.ts`).
	 *
	 * Copied from `ts.SourceFile#isDeclarationFile`.
	 */
	isDeclaration: boolean;

	/**
	 * Indicates if the file is a test file (typically `*.test.ts`).
	 *
	 * Detected from the file name.
	 */
	isTest: boolean;
}

/**
 * Supported file types for TypeScript source inspection.
 */
export type FileType = "ts" | "tsx" | "js" | "jsx" | "json";
