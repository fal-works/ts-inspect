/**
 * Main entry point for the ts-inspect library providing TypeScript AST inspection utilities.
 */

export { createAsAssertionInspector } from "./builtin-inspectors/index.ts";
export { rawJsonReporter, summaryReporter } from "./builtin-reporters/index.ts";
export type {
	CodeLocation,
	DetailedFinding,
	DiagnosticDetails,
	DiagnosticSeverity,
	Diagnostics,
	Finding,
	RichDiagnostics,
	RichDiagnosticsFileScope,
	SimpleDiagnostics,
	SimpleDiagnosticsFileScope,
} from "./diagnostics/index.ts";
export { markup, translateSeverityToExitCode } from "./diagnostics/index.ts";
export type { TsInspectError } from "./error.ts";
export type {
	FileInspectionResult,
	Inspector,
	InspectorResult,
	InspectorResults,
	NodeInspector,
	ResultsBuilder,
} from "./inspector/index.ts";
export { type InspectOptions, inspectFiles, inspectProject } from "./orchestrator/index.ts";
export type { Reporter } from "./reporter/index.ts";
export {
	createPrinter,
	createXmlPrinter,
	type Printer,
	type PrinterOptions,
	type XmlPrinter,
} from "./reporter/index.ts";
