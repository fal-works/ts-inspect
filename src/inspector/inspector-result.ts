/**
 * Inspector result types and structures.
 */

import type { DiagnosticSeverity, Diagnostics } from "../diagnostics/index.ts";
import {
	getWorstSeverityFromArray,
	getWorstSeverityFromDiagnostics,
} from "../diagnostics/tools.ts";

/**
 * Structured result returned by an inspector's ResultsBuilder.
 * Contains all diagnostics found by the inspector plus optional metadata.
 */
export interface InspectorResult {
	/** Unique name identifying the inspector (e.g., "no-type-assertions") */
	inspectorName: string;
	/** Array of diagnostics found by this inspector */
	diagnostics: Diagnostics;
	/** Optional link to detailed documentation about this inspector */
	documentationLink?: string | undefined;
}

/**
 * Array of results from all inspectors that were run.
 * This is the top-level structure passed to reporters for formatting.
 */
export type InspectorResults = InspectorResult[];

/**
 * Gets worst severity from all inspector results.
 */
export function getWorstSeverityFromInspectorResults(
	results: { diagnostics: Diagnostics }[],
): DiagnosticSeverity | null {
	const severities = results
		.map((r) => getWorstSeverityFromDiagnostics(r.diagnostics))
		.filter((s): s is DiagnosticSeverity => s !== null);

	return getWorstSeverityFromArray(severities);
}
