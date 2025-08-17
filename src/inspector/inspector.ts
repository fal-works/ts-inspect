/**
 * Inspector type definitions for TypeScript AST inspection.
 */

import type ts from "typescript";
import type { ParsedSourceFile } from "../source-file/index.ts";
import type { InspectorResult } from "./diagnostics.ts";

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
 * Builds structured results from raw inspection data.
 *
 * @param resultPerFile - Array of raw inspection results per file.
 * @returns A structured `InspectorResult` containing diagnostics and other metadata.
 */
export type ResultsBuilder<TResult> = (
	resultPerFile: FileInspectionResult<TResult>[],
) => InspectorResult;

/**
 * An inspector that analyzes TypeScript AST nodes and processes results.
 */
export interface Inspector<TResult = unknown> {
	/** Inspector name for reporting */
	name: string;
	/** Factory function to create a node inspector for a source file */
	nodeInspectorFactory: NodeInspectorFactory<TResult>;
	/** Function to build structured results from raw inspection data */
	resultsBuilder: ResultsBuilder<TResult>;
}
