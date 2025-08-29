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

// Export functions for testing. Do not include in public API
export { createTestRichDiagnostics, createTestSimpleDiagnostics } from "./test-helpers.ts";

// Export internal utility functions. Do not include in public API
export {
	getOverallWorstSeverity,
	getWorstSeverity,
	getWorstSeverityFromArray,
} from "./tools.ts";
