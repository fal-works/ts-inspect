/**
 * Inspector type definitions and functionality exports.
 */

export type {
	FileInspectionResult,
	Inspector,
	NodeInspector,
	ResultsHandler,
} from "./inspector.ts";
export { runInspectors } from "./runner.ts";
export type { InspectionStatus } from "./status.ts";
export { translateStatusToExitCode } from "./status.ts";
