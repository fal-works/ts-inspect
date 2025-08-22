/**
 * Printing functions for diagnostics.
 */

import type { Printer } from "../../core/printer.ts";
import type {
	DiagnosticSeverity,
	RichDiagnostic,
	SimpleDiagnostic,
} from "../../diagnostics/index.ts";
import {
	printFileDiagnostic,
	printLocationDiagnostic,
	printProjectDiagnostic,
} from "./diagnostic-type-printer.ts";

/**
 * Mapping from diagnostic severity to console icons.
 */
const icons: Record<DiagnosticSeverity, string> = {
	error: "❌",
	warning: "⚠️ ", // extra space needed for alignment (at least on Windows VS Code pwsh terminal with default font)
	info: "ℹ️ ", // same here
};

/**
 * Prints a simple diagnostic item.
 */
export function printSimpleDiagnostic(diagnostic: SimpleDiagnostic, printer: Printer): void {
	const icon = icons[diagnostic.severity];

	if (diagnostic.type === "location") {
		printLocationDiagnostic(diagnostic, icon, printer);
	} else if (diagnostic.type === "file") {
		printFileDiagnostic(diagnostic, icon, printer);
	}
}

/**
 * Prints a rich diagnostic item.
 */
export function printRichDiagnostic(diagnostic: RichDiagnostic, printer: Printer): void {
	const icon = icons[diagnostic.severity];

	// First print the base diagnostic
	if (diagnostic.type === "location") {
		printLocationDiagnostic(diagnostic, icon, printer);
	} else if (diagnostic.type === "file") {
		printFileDiagnostic(diagnostic, icon, printer);
	} else if (diagnostic.type === "project") {
		printProjectDiagnostic(diagnostic, icon, printer);
	}

	// Then add the rich-specific content
	printer.println(diagnostic.details.message);
	if (diagnostic.details.advices) printer.println(diagnostic.details.advices);
}
