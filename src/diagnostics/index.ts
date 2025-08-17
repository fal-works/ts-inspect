/**
 * Diagnostic types and utilities for ts-inspect.
 */

// Export all item types
export type {
	Diagnostic,
	DiagnosticSeverity,
	LocationDiagnostic,
	ModuleDiagnostic,
	ProjectDiagnostic,
	RichDiagnostic,
	RichLocationDiagnostic,
	RichModuleDiagnostic,
	SimpleDiagnostic,
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
