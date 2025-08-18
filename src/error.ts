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
	| { errorCode: "output-file-stream-error"; filePath: string; originalError: Error }
	| { errorCode: "output-file-stream-unexpected-finish"; filePath: string }
	| { errorCode: "unexpected-exception"; caught: unknown };

/**
 * Extracts the original error for the cause property.
 */
function getOriginalError(type: TsInspectErrorType): unknown {
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

/**
 * Represents a fatal runtime error in ts-inspect.
 *
 * Used for errors that prevent further execution, such as configuration or unexpected exceptions.
 * Not intended for reporting inspection or linting issues.
 */
export class TsInspectError extends Error {
	override name = "TsInspectError";
	type: TsInspectErrorType;

	constructor(type: TsInspectErrorType) {
		const originalError = getOriginalError(type);
		const options: ErrorOptions | undefined = originalError ? { cause: originalError } : undefined;
		super(errorTypeToMessage(type), options);
		this.type = type;
	}
}

/**
 * Handles caught exceptions by re-throwing `TsInspectError` or wrapping unexpected exceptions.
 */
function handleCaughtUnexpectedException(caught: unknown): never {
	// Re-throw TsInspectError as-is
	if (caught instanceof TsInspectError) {
		throw caught;
	}
	// Wrap unexpected exceptions
	throw new TsInspectError({
		errorCode: "unexpected-exception",
		caught,
	});
}

/**
 * Wraps a function to catch unexpected exceptions and convert them to `TsInspectError`.
 */
export function wrapUnexpectedExceptions<TArgs extends unknown[], TReturn>(
	fn: (...args: TArgs) => TReturn,
): (...args: TArgs) => TReturn {
	return (...args: TArgs): TReturn => {
		try {
			return fn(...args);
		} catch (caught: unknown) {
			handleCaughtUnexpectedException(caught);
		}
	};
}

/**
 * Wraps an async function to catch unexpected exceptions and convert them to `TsInspectError`.
 */
export function wrapUnexpectedExceptionsAsync<TArgs extends unknown[], TReturn>(
	fn: (...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn> {
	return async (...args: TArgs): Promise<TReturn> => {
		try {
			return await fn(...args);
		} catch (caught: unknown) {
			handleCaughtUnexpectedException(caught);
		}
	};
}
