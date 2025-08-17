/**
 * Diagnostic severity levels and related functions.
 */

/**
 * Severity levels for diagnostics.
 * - `error`: Issues that should be fixed (causes exit code 1)
 * - `warning`: Issues that should be reviewed but don't cause failure (exit code 0)
 * - `info`: Informational notices (exit code 0)
 */
export type DiagnosticSeverity = "error" | "warning" | "info";

/**
 * Mapping from severity code to precedence order.
 */
const severityOrder: Record<DiagnosticSeverity, number> = { error: 2, warning: 1, info: 0 };

/**
 * Detects the worst severity from an array of severities.
 * Returns null if array is empty (treated as success).
 */
export function getWorstSeverityFromArray(
	severities: DiagnosticSeverity[],
): DiagnosticSeverity | null {
	if (severities.length === 0) return null;

	let worst: DiagnosticSeverity = severities[0];
	for (let i = 1; i < severities.length; i++) {
		const current = severities[i];
		if (severityOrder[current] > severityOrder[worst]) {
			worst = current;
		}
	}

	return worst;
}

/**
 * Translates severity to exit code.
 */
export function translateSeverityToExitCode(severity: DiagnosticSeverity | null): 0 | 1 {
	return severity === "error" ? 1 : 0;
}
