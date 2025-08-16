/**
 * Error handling for ts-inspect library.
 */

import type ts from "typescript";
import { formatDiagnostics } from "./core/ts/diagnostics.ts";

/**
 * Error types using discriminated union with errorCode.
 */
export type TsInspectErrorType =
	| { errorCode: "invalid-project-path"; path: string }
	| { errorCode: "config-file-not-found"; directoryPath: string }
	| { errorCode: "config-file-read-failure"; diagnostics: ts.Diagnostic[] }
	| { errorCode: "config-parse-failure"; diagnostics: ts.Diagnostic[] }
	| { errorCode: "unexpected-exception"; caught: unknown };

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
		case "unexpected-exception":
			return `Unexpected exception: ${String(errorType.caught)}`;
	}
}

/**
 * Represents a fatal runtime error in ts-inspect.
 *
 * Used for errors that prevent further execution, such as configuration or unexpected exceptions.
 * Not intended for reporting inspection or linting issues.
 */
export class TsInspectError extends Error {
	type: TsInspectErrorType;

	constructor(type: TsInspectErrorType) {
		const options: ErrorOptions | undefined =
			type.errorCode === "unexpected-exception" ? { cause: type.caught } : undefined;
		super(errorTypeToMessage(type), options);
		this.name = "TsInspectError";
		this.type = type;
	}
}
