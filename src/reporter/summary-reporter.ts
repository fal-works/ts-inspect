/**
 * Summary reporter that formats inspection results for human-readable console output.
 */

import { createPrinter, type Printer } from "../core/printer.ts";
import type { DiagnosticItem, DiagnosticSeverity, InspectorResult } from "../inspector/index.ts";
import { getWorstSeverity } from "../inspector/index.ts";
import type { Reporter } from "./reporter.ts";

/**
 * Mapping from diagnostic severity to console icons.
 */
const icons: Record<DiagnosticSeverity, string> = {
	error: "❌",
	warning: "⚠️ ", // extra space needed for alignment (at least on Windows VS Code pwsh terminal with default font)
	info: "ℹ️ ", // same here
};

/**
 * Formats a single diagnostic item using the printer.
 */
function formatDiagnostic(diagnostic: DiagnosticItem, printer: Printer): void {
	const icon = icons[diagnostic.severity];

	if (diagnostic.type === "location-simple") {
		const snippet = diagnostic.snippet ? ` - ${diagnostic.snippet}` : "";
		printer.println(`${icon} ${diagnostic.file}:${diagnostic.line}${snippet}`);
	} else if (diagnostic.type === "location-rich") {
		const snippet = diagnostic.snippet ? ` - ${diagnostic.snippet}` : "";
		printer.println(`${icon} ${diagnostic.file}:${diagnostic.line}${snippet}`);
		printer.println(diagnostic.message);
		if (diagnostic.advices) {
			printer.println(diagnostic.advices);
		}
	} else if (diagnostic.type === "module") {
		printer.println(`${icon} ${diagnostic.file}`);
		printer.println(diagnostic.message);
	} else if (diagnostic.type === "project") {
		printer.println(`${icon} ${diagnostic.message}`);
	}
}

/**
 * Formats a single inspector result using the printer.
 */
function formatInspectorResult(result: InspectorResult, printer: Printer): void {
	const severity = getWorstSeverity(result.diagnostics);
	if (severity === null) return; // Skip inspectors with no issues

	printer.group(`[${result.inspectorName}]`);
	if (result.message) printer.println(result.message);

	const diagnostics: DiagnosticItem[] = result.diagnostics;
	if (diagnostics.length > 0) {
		printer.newLine();

		for (let i = 0; i < diagnostics.length; i++) {
			const diagnostic = diagnostics[i];
			formatDiagnostic(diagnostic, printer);

			// Add empty line between multi-line diagnostic items (but not after the last one)
			if (i < diagnostics.length - 1 && diagnostic.type !== "location-simple") {
				printer.newLine();
			}
		}
	}

	if (result.advices) {
		printer.newLine();
		printer.println(`💡 ${result.advices}`);
	}

	printer.groupEnd();
}

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
		formatInspectorResult(resultsWithIssues[i], printer);

		// Add empty line between inspector results (but not after the last one)
		if (i < resultsWithIssues.length - 1) {
			printer.newLine();
		}
	}
};
