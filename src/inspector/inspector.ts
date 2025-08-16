/**
 * Inspector type definitions for TypeScript AST inspection.
 */

import type ts from "typescript";
import type { ParsedSourceFile } from "../source-file/index.ts";
import type { InspectionStatus } from "./status.ts";

/**
 * Result object of inspecting a single file.
 */
export interface FileInspectionResult<TResult> {
	srcFile: ParsedSourceFile;
	result: TResult;
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

/**
 * Factory function that creates a NodeInspector for a given source file.
 */
export type NodeInspectorFactory<TResult> = (srcFile: ts.SourceFile) => NodeInspector<TResult>;

/**
 * Processes inspection results from all files and returns a status.
 */
export type ResultsHandler<TResult> = (
	resultPerFile: FileInspectionResult<TResult>[],
) => InspectionStatus;

/**
 * An inspector that analyzes TypeScript AST nodes and processes results.
 */
export interface Inspector<TResult = unknown> {
	nodeInspectorFactory: NodeInspectorFactory<TResult>;
	resultsHandler: ResultsHandler<TResult>;
}
