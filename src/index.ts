/**
 * Main entry point for the ts-inspect library providing TypeScript AST inspection utilities.
 */

export { createNoTypeAssertionsInspector } from "./builtin-inspectors/index.ts";
export { createRawJsonReporter, createSummaryReporter } from "./builtin-reporters/index.ts";
export type { TsInspectError } from "./error.ts";
export {
	type InspectOptions,
	inspectFiles,
	inspectProject,
	translateSeverityToExitCode,
} from "./orchestrator/index.ts";
