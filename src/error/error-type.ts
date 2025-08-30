/**
 * Error type definitions and utilities.
 */

import type ts from "typescript";
import { formatDiagnostics } from "../internal/utils/ts/diagnostics.ts";

/**
 * Error types using discriminated union with errorCode.
 */
export type TsInspectErrorType =
	| { errorCode: "invalid-project-path"; path: string }
	| { errorCode: "config-file-not-found"; directoryPath: string }
	| { errorCode: "config-file-read-failure"; diagnostics: ts.Diagnostic[] }
	| { errorCode: "config-parse-failure"; diagnostics: ts.Diagnostic[] }
	| { errorCode: "output-file-stream-error"; filePath: string; originalError: Error }
	| { errorCode: "output-file-stream-unexpected-finish"; filePath: string }
	| { errorCode: "unexpected-exception"; caught: unknown };

/**
 * Extracts the original error for the cause property.
 */
export function getOriginalError(type: TsInspectErrorType): unknown {
	switch (type.errorCode) {
		case "output-file-stream-error":
			return type.originalError;
		case "unexpected-exception":
			return type.caught;
		default:
			return undefined;
	}
}

/**
 * Converts error type to human-readable message.
 */
export function errorTypeToMessage(errorType: TsInspectErrorType): string {
	switch (errorType.errorCode) {
		case "invalid-project-path":
			return `The specified project path is neither a JSON file nor a directory: ${errorType.path}`;
		case "config-file-not-found":
			return `No tsconfig.json or jsconfig.json found in directory: ${errorType.directoryPath}`;
		case "config-file-read-failure":
			return formatDiagnostics(errorType.diagnostics);
		case "config-parse-failure":
			return formatDiagnostics(errorType.diagnostics);
		case "output-file-stream-error":
			return `Failed to write to output file '${errorType.filePath}': ${String(errorType.originalError)}`;
		case "output-file-stream-unexpected-finish":
			return `Output stream for '${errorType.filePath}' finished unexpectedly during inspection`;
		case "unexpected-exception":
			return `Unexpected exception: ${String(errorType.caught)}`;
	}
}
