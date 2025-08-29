/**
 * Printing function for inspector result.
 */

import type { InspectorResult } from "../../../inspector/index.ts";
import type { Printer } from "../../../reporter/index.ts";
import { printRichDiagnostics, printSimpleDiagnostics } from "./diagnostics-printer.ts";
import { printMarkup } from "./markup-printer/index.ts";

/**
 * Prints inspector-level message for simple diagnostics.
 */
function printInspectorMessage(result: InspectorResult, printer: Printer): void {
	if (result.diagnostics.type === "simple" && result.diagnostics.details.message) {
		printer.println(result.diagnostics.details.message);
	}
}

/**
 * Prints inspector-level instructions for simple diagnostics.
 */
function printInspectorInstructions(result: InspectorResult, printer: Printer): void {
	if (result.diagnostics.type === "simple" && result.diagnostics.details.instructions) {
		printer.newLine(1);
		if (typeof result.diagnostics.details.instructions === "string") {
			printer.println(result.diagnostics.details.instructions.trim());
		} else {
			printMarkup(result.diagnostics.details.instructions, printer);
		}
	}
}

/**
 * Prints a single inspector result.
 */
export function printInspectorResult(result: InspectorResult, printer: Printer): void {
	const diagnostics = result.diagnostics;

	printer.group(`[${result.inspectorName}]`);

	// Print inspector message
	printInspectorMessage(result, printer);

	// Print diagnostics
	printer.newLine();
	if (diagnostics.type === "simple") {
		printSimpleDiagnostics(diagnostics, printer);
	} else {
		printRichDiagnostics(diagnostics, printer);
	}

	// Print inspector instructions
	printInspectorInstructions(result, printer);

	printer.groupEnd();
}
