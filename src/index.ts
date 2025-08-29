/**
 * Main entry point for the ts-inspect library providing TypeScript AST inspection utilities.
 */

// Built-in inspector functions
export { createNoTypeAssertionsInspector } from "./builtin-inspectors/index.ts";
// Built-in reporter functions
export { createRawJsonReporter, createSummaryReporter } from "./builtin-reporters/index.ts";
// Diagnostics handling
export { translateSeverityToExitCode } from "./diagnostics/index.ts";
// Error handling
export type { TsInspectError } from "./error.ts";
// Orchestrator functions/types
export { type InspectOptions, inspectFiles, inspectProject } from "./orchestrator/index.ts";
