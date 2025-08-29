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
// Export markup package
export * as markup from "./markup/index.ts";
// Export functions for testing. Do not include in public API
export { createTestRichDiagnostics, createTestSimpleDiagnostics } from "./test-helpers.ts";
// Export essential utility functions.
// Some of these are for internal use and not part of the public API
export {
	getOverallWorstSeverity,
	getWorstSeverity,
	getWorstSeverityFromArray,
} from "./tools.ts";
