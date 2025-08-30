/**
 * Diagnostic types and utilities for ts-inspect.
 */

// Export common types
export type { CodeLocation, DiagnosticDetails, DiagnosticSeverity } from "./common-types.ts";

// Export diagnostic types
export type {
	Diagnostics,
	RichDiagnostics,
	RichDiagnosticsFileScope,
	SimpleDiagnostics,
	SimpleDiagnosticsFileScope,
} from "./diagnostic-types.ts";

// Export finding types
export type { DetailedFinding, Finding } from "./finding-types.ts";

// Export utility functions
export {
	getWorstSeverityFromArray,
	getWorstSeverityFromDiagnostics,
} from "./tools.ts";
