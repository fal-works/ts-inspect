/**
 * Printing function for inspector result.
 */

import type { Printer } from "../../core/printer.ts";
import { getWorstSeverity } from "../../diagnostics/index.ts";
import type { InspectorResult } from "../../inspector/index.ts";
import { printRichDiagnostic, printSimpleDiagnostic } from "./diagnostic-printer.ts";

/**
 * Prints a single inspector result.
 */
export function printInspectorResult(result: InspectorResult, printer: Printer): void {
	const severity = getWorstSeverity(result.diagnostics);
	if (severity === null) return; // Skip inspectors with no issues

	printer.group(`[${result.inspectorName}]`);

	const diagnostics = result.diagnostics;

	// Print message from diagnostics (both simple and rich diagnostics may have messages)
	if (diagnostics.type === "simple" && diagnostics.details.message) {
		printer.println(diagnostics.details.message);
	}

	if (diagnostics.items.length > 0) {
		printer.newLine();

		if (diagnostics.type === "simple") {
			// Simple diagnostics: no spacing between items since they're all single-line
			for (const diagnostic of diagnostics.items) {
				printSimpleDiagnostic(diagnostic, printer);
			}
		} else {
			// Rich diagnostics: add spacing between multi-line items
			for (let i = 0; i < diagnostics.items.length; i++) {
				const diagnostic = diagnostics.items[i];
				printRichDiagnostic(diagnostic, printer);

				// Add empty line between rich diagnostic items (but not after the last one)
				printer.newLine();
			}
		}
	}

	// Print advices from diagnostics (simple diagnostics have general advice)
	if (diagnostics.type === "simple" && diagnostics.details.advices) {
		printer.newLine(1);
		printer.println(`💡 ${diagnostics.details.advices}`);
	}

	printer.groupEnd();
}
