/**
 * TsInspectError class definition.
 */

import { errorTypeToMessage, getOriginalError, type TsInspectErrorType } from "./error-type.ts";

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
