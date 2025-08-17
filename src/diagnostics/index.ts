/**
 * Diagnostic types and utilities for ts-inspect.
 */

// Export all item types
export type {
	Diagnostic,
	DiagnosticSeverity,
	RichDiagnostic,
	RichLocationDiagnostic,
	RichModuleDiagnostic,
	RichProjectDiagnostic,
	SimpleDiagnostic,
	SimpleLocationDiagnostic,
	SimpleModuleDiagnostic,
	SimpleProjectDiagnostic,
} from "./item-types.ts";

// Export all list types
export type { Diagnostics, RichDiagnostics, SimpleDiagnostics } from "./list-types.ts";

// Export all utility functions
export {
	getOverallWorstSeverity,
	getWorstSeverity,
	getWorstSeverityFromArray,
	translateSeverityToExitCode,
} from "./tools.ts";
