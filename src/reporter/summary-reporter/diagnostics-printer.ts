/**
 * Functions for printing diagnostics.
 */

import type { Printer } from "../../core/printer.ts";
import type { RichDiagnostics, SimpleDiagnostics } from "../../diagnostics/index.ts";
import { collectRichDiagnosticItems, printRichDiagnosticItems } from "./diagnostic-items.ts";
import { printLocationFinding } from "./finding-printer.ts";

/**
 * Prints simple diagnostics by flattening all findings across files.
 * @package
 */
export function printSimpleDiagnostics(diagnostics: SimpleDiagnostics, printer: Printer): void {
	for (const [file, fileScope] of diagnostics.perFile) {
		for (const [location, finding] of fileScope.locations) {
			printLocationFinding(file, location, finding.severity, printer);
		}
	}
}

/**
 * Prints rich diagnostics by collecting items and printing them with proper spacing.
 * @package
 */
export function printRichDiagnostics(diagnostics: RichDiagnostics, printer: Printer): void {
	const richItems = collectRichDiagnosticItems(diagnostics);
	printRichDiagnosticItems(richItems, printer);
}
