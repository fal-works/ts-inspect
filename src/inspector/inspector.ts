/**
 * Inspector type definitions for TypeScript AST inspection.
 */

import type ts from "typescript";
import type { InspectorResult } from "./inspector-result.ts";
import type { ParsedSourceFile } from "./source-file-types.ts";

/**
 * Result object of inspecting a single file.
 */
export interface FileInspectionResult<TState> {
	srcFile: ParsedSourceFile;
	finalState: TState;
}

/**
 * A function that inspects a TypeScript node and returns a state.
 *
 * @returns The state of the inspection that will be passed when calling this function for the next node.
 * - Return `null` to nullify the state.
 * - Return `undefined` to keep the recent state unchanged.
 */
export type NodeInspector<TState> = (
	node: ts.Node,
	recentState: TState | null,
) => TState | null | undefined;

/**
 * Factory function that creates a NodeInspector for a given source file.
 */
export type NodeInspectorFactory<TState> = (srcFile: ts.SourceFile) => NodeInspector<TState>;

/**
 * Builds structured results from accumulated inspection state.
 *
 * @param resultPerFile - Array of final inspection states per file.
 * @returns A structured `InspectorResult` containing diagnostics and other metadata.
 */
export type ResultsBuilder<TState> = (
	resultPerFile: FileInspectionResult<TState>[],
) => InspectorResult;

/**
 * An inspector that analyzes TypeScript AST nodes and processes accumulated state.
 */
export interface Inspector<TState = unknown> {
	/** Inspector name for reporting */
	name: string;
	/** Factory function to create a node inspector for a source file */
	nodeInspectorFactory: NodeInspectorFactory<TState>;
	/** Function to build structured results from accumulated inspection state */
	resultsBuilder: ResultsBuilder<TState>;
}
