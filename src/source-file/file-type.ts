import { extname } from "node:path";
import ts from "typescript";
import { setHasValue } from "../core/utils.ts";

export type FileType = "ts" | "tsx" | "js" | "jsx" | "json";

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

export function createFileTypeValidator<TFileType extends FileType>(
	fileTypes: readonly TFileType[] | undefined,
): (fileType: FileType) => fileType is TFileType {
	if (fileTypes) {
		const includingFileTypes: ReadonlySet<TFileType> = new Set(fileTypes);
		return (fileType) => setHasValue(includingFileTypes, fileType);
	} else {
		return (fileType): fileType is TFileType => true;
	}
}

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
