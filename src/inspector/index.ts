/**
 * Inspector type definitions and functionality exports.
 */

export type {
	FileInspectionResult,
	Inspector,
	NodeInspector,
	NodeInspectorFactory,
	ResultsBuilder,
} from "./inspector.ts";
export type { InspectorResult, InspectorResults } from "./inspector-result.ts";
export { runInspectors } from "./runner.ts";
export type { FileType, ParsedSourceFile, ParsedSourceFileMetadata } from "./source-file-types.ts";
