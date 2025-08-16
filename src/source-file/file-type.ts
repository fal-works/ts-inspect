/**
 * File type classification utilities for TypeScript source files.
 */

import { extname } from "node:path";
import ts from "typescript";
import { setHasValue } from "../core/utils.ts";

/**
 * Supported file types for TypeScript source inspection.
 */
export type FileType = "ts" | "tsx" | "js" | "jsx" | "json";

/**
 * Determines the file type from a file name's extension.
 */
export function getFileTypeFromExtension(fileName: string): FileType | null {
	switch (extname(fileName)) {
		case ".ts":
		case ".mts":
		case ".cts":
			return "ts";
		case ".tsx":
			return "tsx";
		case ".js":
		case ".mjs":
		case ".cjs":
			return "js";
		case ".jsx":
			return "jsx";
		case ".json":
			return "json";
		default:
			return null;
	}
}

/**
 * Maps a file type to TypeScript's ScriptKind enumeration.
 */
export function getScriptKind(fileType: FileType): ts.ScriptKind {
	switch (fileType) {
		case "ts":
			return ts.ScriptKind.TS;
		case "tsx":
			return ts.ScriptKind.TSX;
		case "js":
			return ts.ScriptKind.JS;
		case "jsx":
			return ts.ScriptKind.JSX;
		case "json":
			return ts.ScriptKind.JSON;
	}
}

/**
 * Creates a validator function to check if a file type is included in the allowed types.
 */
export function createFileTypeValidator<TFileType extends FileType>(
	fileTypes: readonly TFileType[] | undefined,
): (fileType: FileType) => fileType is TFileType {
	if (fileTypes) {
		const includingFileTypes: ReadonlySet<TFileType> = new Set(fileTypes);
		return (fileType): fileType is TFileType => setHasValue(includingFileTypes, fileType);
	} else {
		return (_): _ is TFileType => true;
	}
}
