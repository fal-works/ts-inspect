/**
 * Utility functions for working with diagnostics and severity.
 */

import type { DiagnosticSeverity } from "./common-types.ts";
import type { Diagnostics } from "./list-types.ts";

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

/**
 * Detects the worst severity from diagnostics.
 * Returns null if no diagnostics (treated as success).
 */
export function getWorstSeverity(diagnostics: Diagnostics): DiagnosticSeverity | null {
	const items = diagnostics.items;
	if (items.length === 0) return null;

	const severities = items.map((item) => item.severity);
	return getWorstSeverityFromArray(severities);
}

/**
 * Gets worst severity from all inspector results.
 */
export function getOverallWorstSeverity(
	results: { diagnostics: Diagnostics }[],
): DiagnosticSeverity | null {
	const severities = results
		.map((r) => getWorstSeverity(r.diagnostics))
		.filter((s): s is DiagnosticSeverity => s !== null);

	return getWorstSeverityFromArray(severities);
}
