/**
 * Inspector type definitions and functionality exports.
 */

export type {
	DiagnosticItem,
	DiagnosticSeverity,
	Diagnostics,
	InspectorResult,
	InspectorResults,
	ModuleDiagnostic,
	ProjectDiagnostic,
	RichLocationDiagnostic,
	SimpleLocationDiagnostic,
} from "./diagnostics.ts";
export {
	getOverallWorstSeverity,
	getWorstSeverity,
	translateSeverityToExitCode,
} from "./diagnostics.ts";
export type {
	FileInspectionResult,
	Inspector,
	NodeInspector,
	NodeInspectorFactory,
	ResultsBuilder,
} from "./inspector.ts";
export { runInspectors } from "./runner.ts";
