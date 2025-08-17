/**
 * Utility functions for working with diagnostics and inspector results.
 */

import type { Diagnostics } from "./diagnostics.ts";
import type { InspectorResults } from "./inspector-result.ts";
import { type DiagnosticSeverity, getWorstSeverityFromArray } from "./severity.ts";

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
export function getOverallWorstSeverity(results: InspectorResults): DiagnosticSeverity | null {
	const severities = results
		.map((r) => getWorstSeverity(r.diagnostics))
		.filter((s): s is DiagnosticSeverity => s !== null);

	return getWorstSeverityFromArray(severities);
}
