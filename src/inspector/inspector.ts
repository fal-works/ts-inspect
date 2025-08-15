import type ts from "typescript";
import type { ParsedSourceFile } from "../source-file/index.ts";

export interface Inspector<TResult = unknown> {
	nodeInspectorFactory: (srcFile: ts.SourceFile) => NodeInspector<TResult>;
	resultsHandler: ResultsHandler<TResult>;
}

/**
 * A function that inspects a TypeScript node and returns a result.
 *
 * @returns The result of the inspection that will be passed when calling this function for the next node.
 * - Return `null` to nullify the result.
 * - Return `undefined` to keep the recent result unchanged.
 */
export type NodeInspector<TResult> = (
	node: ts.Node,
	recentResult: TResult | null,
) => TResult | null | undefined;

export type ResultsHandler<TResult> = (
	resultPerFile: FileInspectionResult<TResult>[],
) => InspectionStatus;

export interface FileInspectionResult<TResult> {
	srcFile: ParsedSourceFile;
	result: TResult;
}

export type InspectionStatus = "error" | "warn" | "success";
