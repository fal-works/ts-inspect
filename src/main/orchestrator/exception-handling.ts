/**
 * Exception handling utilities for orchestrator workflow.
 */

import { TsInspectError } from "../../error/index.ts";

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
