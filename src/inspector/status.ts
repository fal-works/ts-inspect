/**
 * Status types and utilities for inspection operations.
 */

/**
 * Status returned by inspection operations.
 */
export type InspectionStatus = "error" | "warn" | "success";

/**
 * Translates inspection status to process exit code following Unix conventions.
 * - "success" and "warn" → 0 (success)
 * - "error" → 1 (error)
 *
 * @example
 * process.exitCode = translateStatusToExitCode(status);
 */
export function translateStatusToExitCode(status: InspectionStatus): 0 | 1 {
	switch (status) {
		case "success":
			return 0;
		case "warn":
			return 0;
		case "error":
			return 1;
	}
}
