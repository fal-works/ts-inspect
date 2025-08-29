/**
 * Utility functions for orchestration logic including exit code handling.
 */

import type { DiagnosticSeverity } from "../diagnostics/common-types.ts";

/**
 * Translates severity to exit code.
 */
export function translateSeverityToExitCode(severity: DiagnosticSeverity | null): 0 | 1 {
	return severity === "error" ? 1 : 0;
}
