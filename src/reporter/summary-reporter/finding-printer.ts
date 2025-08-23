/**
 * Low-level diagnostic type printing functions.
 */

import type { Printer } from "../../core/printer.ts";
import type { CodeLocation, DetailedFinding, DiagnosticSeverity } from "../../diagnostics/index.ts";
import { formatCodeSnippet } from "./formatter.ts";

/**
 * Mapping from diagnostic severity to console icons.
 */
const icons: Record<DiagnosticSeverity, string> = {
	error: "❌",
	warning: "⚠️ ", // extra space needed for alignment
	info: "ℹ️ ", // same here
};

/**
 * Prints a location finding.
 */
export function printLocationFinding(
	file: string,
	location: CodeLocation,
	severity: DiagnosticSeverity,
	printer: Printer,
): void {
	const icon = icons[severity];
	if (location.snippet) {
		const formattedSnippet = formatCodeSnippet(location.snippet);
		if (formattedSnippet.includes("\n")) {
			// Multiline snippet: empty line before and after snippet
			printer.newLine(1);
			printer.println(`${icon} ${file}:${location.line}`);
			printer.println(formattedSnippet);
			printer.newLine();
		} else {
			// Single line snippet: keep on same line
			printer.println(`${icon} ${file}:${location.line} - ${formattedSnippet}`);
		}
	} else {
		printer.println(`${icon} ${file}:${location.line}`);
	}
}

/**
 * Prints a rich location finding with individual message.
 */
export function printRichLocationFinding(
	file: string,
	location: CodeLocation,
	finding: DetailedFinding,
	printer: Printer,
): void {
	printLocationFinding(file, location, finding.severity, printer);
	// Print individual message and advice
	printer.println(finding.message);
	if (finding.advices) {
		printer.println(finding.advices);
	}
}

/**
 * Prints a file-level finding.
 */
export function printFileFinding(file: string, finding: DetailedFinding, printer: Printer): void {
	const icon = icons[finding.severity];
	printer.println(`${icon} ${file}`);
	printer.println(finding.message);
	if (finding.advices) {
		printer.println(`💡 ${finding.advices}`);
	}
}

/**
 * Prints a project-level finding.
 */
export function printProjectFinding(finding: DetailedFinding, printer: Printer): void {
	const icon = icons[finding.severity];
	printer.println(`${icon} (project-level issue)`);
	printer.println(finding.message);
	if (finding.advices) {
		printer.println(`💡 ${finding.advices}`);
	}
}
