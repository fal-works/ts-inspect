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
		printer.print(`${icon} ${diagnostic.file}:${diagnostic.line}${snippet}`);
	} else if (diagnostic.type === "location-rich") {
		const snippet = diagnostic.snippet ? ` - ${diagnostic.snippet}` : "";
		printer.print(`${icon} ${diagnostic.file}:${diagnostic.line}${snippet}`);
		printer.println(diagnostic.message);
		if (diagnostic.advices) {
			printer.println(diagnostic.advices);
		}
	} else if (diagnostic.type === "module") {
		printer.print(`${icon} ${diagnostic.file}`);
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

	printer.group(`${result.inspectorName}:`);

	if (result.message) {
		printer.print(result.message);
	}

	const diagnostics = Array.isArray(result.diagnostics) ? result.diagnostics : [];

	for (const diagnostic of diagnostics) {
		formatDiagnostic(diagnostic, printer);
	}

	if (result.advices) {
		printer.print(`💡 ${result.advices}`);
	}

	printer.groupEnd();
}

/**
 * Built-in summary reporter with improved format for consistency with common linters.
 */
export const summaryReporter: Reporter = (results) => {
	const printer = createPrinter();

	for (const result of results) {
		formatInspectorResult(result, printer);
	}

	return printer.getOutput();
};
