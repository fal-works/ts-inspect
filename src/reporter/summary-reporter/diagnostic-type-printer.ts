/**
 * Printing functions for specific types of diagnostics.
 */

import type { Printer } from "../../core/printer.ts";
import type {
	LocationDiagnostic,
	ModuleDiagnostic,
	ProjectDiagnostic,
} from "../../diagnostics/index.ts";
import { formatCodeSnippet } from "./formatter.ts";

/**
 * Prints a location diagnostic.
 */
export function printLocationDiagnostic(
	diagnostic: LocationDiagnostic,
	icon: string,
	printer: Printer,
): void {
	if (diagnostic.location.snippet) {
		const formattedSnippet = formatCodeSnippet(diagnostic.location.snippet);
		if (formattedSnippet.includes("\n")) {
			// Multiline snippet: empty line before and after snippet
			printer.newLine(1);
			printer.println(`${icon} ${diagnostic.file}:${diagnostic.location.line}`);
			printer.println(formattedSnippet);
			printer.newLine();
		} else {
			// Single line snippet: keep on same line
			printer.println(
				`${icon} ${diagnostic.file}:${diagnostic.location.line} - ${formattedSnippet}`,
			);
		}
	} else {
		printer.println(`${icon} ${diagnostic.file}:${diagnostic.location.line}`);
	}
}

/**
 * Prints a module diagnostic.
 */
export function printModuleDiagnostic(
	diagnostic: ModuleDiagnostic,
	icon: string,
	printer: Printer,
): void {
	printer.println(`${icon} ${diagnostic.file}`);
}

/**
 * Prints a project diagnostic.
 */
export function printProjectDiagnostic(
	_diagnostic: ProjectDiagnostic,
	icon: string,
	printer: Printer,
): void {
	printer.println(`${icon} (project-level issue)`);
}
