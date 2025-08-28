/**
 * Summary reporter that formats inspection results for human-readable console output.
 */

import { getWorstSeverity } from "../../diagnostics/index.ts";
import { createPrinter } from "../../reporter/index.ts";
import type { Reporter } from "../../reporter/reporter.ts";
import { printInspectorResult } from "./inspector-result-printer.ts";

/**
 * Built-in summary reporter.
 */
export const summaryReporter: Reporter = (results, output) => {
	const printer = createPrinter(output);

	// Filter out results with no issues to avoid unnecessary spacing
	const resultsWithDiagnostics = results.filter(
		(result) => getWorstSeverity(result.diagnostics) !== null,
	);

	for (let i = 0; i < resultsWithDiagnostics.length; i++) {
		printInspectorResult(resultsWithDiagnostics[i], printer);

		// Add empty line between inspector results (but not after the last one)
		if (i < resultsWithDiagnostics.length - 1) {
			printer.newLine();
		}
	}
};
