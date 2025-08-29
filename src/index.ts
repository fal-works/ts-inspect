/**
 * Main entry point for the ts-inspect library providing TypeScript AST inspection utilities.
 */

export type { TsInspectError } from "./error.ts";
export { createNoTypeAssertionsInspector } from "./main/builtin-inspectors/index.ts";
export { createRawJsonReporter, createSummaryReporter } from "./main/builtin-reporters/index.ts";
export {
	type InspectOptions,
	inspectFiles,
	inspectProject,
	translateSeverityToExitCode,
} from "./main/orchestrator/index.ts";
