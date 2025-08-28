/**
 * Internal functions for collecting and structuring diagnostic items.
 */

import type { CodeLocation, DetailedFinding, RichDiagnostics } from "../../diagnostics/index.ts";
import type { Printer } from "../../printer/printer.ts";
import {
	printFileFinding,
	printProjectFinding,
	printRichLocationFinding,
} from "./finding-printer.ts";

// Rich diagnostic item types for internal processing
type ProjectItem = { type: "project"; finding: DetailedFinding };
type FileItem = { type: "file"; finding: DetailedFinding; file: string };
type LocationItem = {
	type: "location";
	finding: DetailedFinding;
	file: string;
	location: CodeLocation;
};
type RichDiagnosticItem = ProjectItem | FileItem | LocationItem;

/**
 * Collects all rich diagnostic items into a flat array for printing.
 * @package
 */
export function collectRichDiagnosticItems(diagnostics: RichDiagnostics): RichDiagnosticItem[] {
	const allItems: RichDiagnosticItem[] = [];

	// Add project-level findings
	for (const finding of diagnostics.project) {
		allItems.push({ type: "project", finding });
	}

	// Add file-level findings (flattened)
	for (const [file, fileScope] of diagnostics.perFile) {
		for (const finding of fileScope.wholeFile) {
			allItems.push({ type: "file", finding, file });
		}
		for (const [location, finding] of fileScope.locations) {
			allItems.push({ type: "location", finding, file, location });
		}
	}

	return allItems;
}

/**
 * Prints rich diagnostic items with proper spacing between items.
 * @package
 */
export function printRichDiagnosticItems(items: RichDiagnosticItem[], printer: Printer): void {
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		if (item.type === "project") {
			printProjectFinding(item.finding, printer);
		} else if (item.type === "file") {
			printFileFinding(item.file, item.finding, printer);
		} else if (item.type === "location") {
			printRichLocationFinding(item.file, item.location, item.finding, printer);
		}
		// Add spacing between rich items (but not after the last one)
		if (i < items.length - 1) {
			printer.newLine();
		}
	}
}
