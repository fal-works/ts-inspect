/**
 * TypeScript diagnostic formatting utilities.
 */

import ts from "typescript";

const host: ts.FormatDiagnosticsHost = {
	getCanonicalFileName: (f) => f,
	getCurrentDirectory: ts.sys.getCurrentDirectory,
	getNewLine: () => "\n",
};

/**
 * Formats TypeScript diagnostics for display.
 */
export function formatDiagnostics(
	diagnostics: ts.Diagnostic[],
	withColorAndContext = true,
): string {
	if (withColorAndContext) {
		return ts.formatDiagnosticsWithColorAndContext(diagnostics, host);
	} else {
		return ts.formatDiagnostics(diagnostics, host);
	}
}
