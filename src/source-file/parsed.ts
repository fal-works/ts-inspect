import type ts from "typescript";
import type { FileType } from "./file-type.ts";

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
