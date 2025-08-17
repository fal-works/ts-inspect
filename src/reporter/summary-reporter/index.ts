/**
 * Summary reporter that formats inspection results for human-readable console output.
 */

import { createPrinter } from "../../core/printer.ts";
import { getWorstSeverity } from "../../diagnostics/index.ts";
import type { Reporter } from "../reporter.ts";
import { printInspectorResult } from "./inspector-result-printer.ts";

/**
 * Built-in summary reporter.
 */
export const summaryReporter: Reporter = (results, output) => {
	const printer = createPrinter(output);

	// Filter out results with no issues to avoid unnecessary spacing
	const resultsWithIssues = results.filter(
		(result) => getWorstSeverity(result.diagnostics) !== null,
	);

	for (let i = 0; i < resultsWithIssues.length; i++) {
		printInspectorResult(resultsWithIssues[i], printer);

		// Add empty line between inspector results (but not after the last one)
		if (i < resultsWithIssues.length - 1) {
			printer.newLine();
		}
	}
};
