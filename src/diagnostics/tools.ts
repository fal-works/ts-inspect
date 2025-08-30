/**
 * Utility functions for working with diagnostics and severity.
 */

import type { DiagnosticSeverity } from "./common-types.ts";
import type { Diagnostics } from "./diagnostic-types.ts";

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
 * Detects the worst severity from diagnostics.
 * Returns null if no diagnostics (treated as success).
 */
export function getWorstSeverityFromDiagnostics(
	diagnostics: Diagnostics,
): DiagnosticSeverity | null {
	const severities: DiagnosticSeverity[] = [];

	if (diagnostics.type === "simple") {
		// Extract severities from perFile Map structure
		for (const fileScope of diagnostics.perFile.values()) {
			for (const [, finding] of fileScope.locations) {
				severities.push(finding.severity);
			}
		}
	} else if (diagnostics.type === "rich") {
		// Extract severities from project-level findings
		for (const finding of diagnostics.project) {
			severities.push(finding.severity);
		}

		// Extract severities from perFile Map structure
		for (const fileScope of diagnostics.perFile.values()) {
			// From whole-file findings
			for (const finding of fileScope.wholeFile) {
				severities.push(finding.severity);
			}
			// From location-specific findings
			for (const [, finding] of fileScope.locations) {
				severities.push(finding.severity);
			}
		}
	}

	return getWorstSeverityFromArray(severities);
}
