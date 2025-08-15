import ts from "typescript";

const host: ts.FormatDiagnosticsHost = {
	getCanonicalFileName: (f) => f,
	getCurrentDirectory: ts.sys.getCurrentDirectory,
	getNewLine: () => "\n",
};

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
