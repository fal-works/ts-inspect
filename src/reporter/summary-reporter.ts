/**
 * Summary reporter that formats inspection results for human-readable console output.
 */

import { createPrinter, type Printer } from "../core/printer.ts";
import type {
	DiagnosticSeverity,
	LocationDiagnostic,
	ModuleDiagnostic,
	ProjectDiagnostic,
	RichDiagnostic,
	SimpleDiagnostic,
} from "../diagnostics/index.ts";
import { getWorstSeverity } from "../diagnostics/index.ts";
import type { InspectorResult } from "../inspector/index.ts";
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
 * Formats a location diagnostic.
 */
function formatLocationDiagnostic(
	diagnostic: LocationDiagnostic,
	icon: string,
	printer: Printer,
): void {
	const snippet = diagnostic.snippet ? ` - ${diagnostic.snippet}` : "";
	printer.println(`${icon} ${diagnostic.file}:${diagnostic.line}${snippet}`);
}

/**
 * Formats a module diagnostic.
 */
function formatModuleDiagnostic(
	diagnostic: ModuleDiagnostic,
	icon: string,
	printer: Printer,
): void {
	printer.println(`${icon} ${diagnostic.file}`);
}

/**
 * Formats a project diagnostic.
 */
function formatProjectDiagnostic(
	_diagnostic: ProjectDiagnostic,
	icon: string,
	printer: Printer,
): void {
	printer.println(`${icon} (project-level issue)`);
}

/**
 * Formats a simple diagnostic item using the printer.
 */
function formatSimpleDiagnostic(diagnostic: SimpleDiagnostic, printer: Printer): void {
	const icon = icons[diagnostic.severity];

	if (diagnostic.type === "location") {
		formatLocationDiagnostic(diagnostic, icon, printer);
	} else if (diagnostic.type === "module") {
		formatModuleDiagnostic(diagnostic, icon, printer);
	}
}

/**
 * Formats a rich diagnostic item using the printer.
 */
function formatRichDiagnostic(diagnostic: RichDiagnostic, printer: Printer): void {
	const icon = icons[diagnostic.severity];

	// First print the base diagnostic
	if (diagnostic.type === "location") {
		formatLocationDiagnostic(diagnostic, icon, printer);
	} else if (diagnostic.type === "module") {
		formatModuleDiagnostic(diagnostic, icon, printer);
	} else if (diagnostic.type === "project") {
		formatProjectDiagnostic(diagnostic, icon, printer);
	}

	// Then add the rich-specific content
	printer.println(diagnostic.message);
	if (diagnostic.advices) printer.println(diagnostic.advices);
}

/**
 * Formats a single inspector result using the printer.
 */
function formatInspectorResult(result: InspectorResult, printer: Printer): void {
	const severity = getWorstSeverity(result.diagnostics);
	if (severity === null) return; // Skip inspectors with no issues

	printer.group(`[${result.inspectorName}]`);
	if (result.message) printer.println(result.message);

	const diagnostics = result.diagnostics;
	if (diagnostics.items.length > 0) {
		printer.newLine();

		if (diagnostics.type === "simple") {
			// Simple diagnostics: no spacing between items since they're all single-line
			for (const diagnostic of diagnostics.items) {
				formatSimpleDiagnostic(diagnostic, printer);
			}
		} else {
			// Rich diagnostics: add spacing between multi-line items
			for (let i = 0; i < diagnostics.items.length; i++) {
				const diagnostic = diagnostics.items[i];
				formatRichDiagnostic(diagnostic, printer);

				// Add empty line between rich diagnostic items (but not after the last one)
				if (i < diagnostics.items.length - 1) {
					printer.newLine();
				}
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
