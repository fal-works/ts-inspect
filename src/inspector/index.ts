/**
 * Inspector type definitions and functionality exports.
 */

export type {
	Diagnostic,
	Diagnostics,
	RichDiagnostic,
	RichDiagnostics,
	RichLocationDiagnostic,
	RichModuleDiagnostic,
	RichProjectDiagnostic,
	SimpleDiagnostic,
	SimpleDiagnostics,
	SimpleLocationDiagnostic,
	SimpleModuleDiagnostic,
	SimpleProjectDiagnostic,
} from "./diagnostics.ts";
export {
	getOverallWorstSeverity,
	getWorstSeverity,
} from "./diagnostics.ts";
export type {
	FileInspectionResult,
	Inspector,
	NodeInspector,
	NodeInspectorFactory,
	ResultsBuilder,
} from "./inspector.ts";
export type { InspectorResult, InspectorResults } from "./inspector-result.ts";
export { runInspectors } from "./runner.ts";
export type { DiagnosticSeverity } from "./severity.ts";
export { translateSeverityToExitCode } from "./severity.ts";
