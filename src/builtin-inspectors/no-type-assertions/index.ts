/**
 * No-type-assertions inspector - detects suspicious type assertions.
 */

import type { Inspector, ResultsHandler } from "../../inspector/index.ts";
import { createNodeInspectorFactory } from "./node-inspector.ts";
import { defaultResultsHandler } from "./results-handler.ts";
import type { TypeAssertionInspectionResult } from "./types.ts";

export type { TypeAssertionFinding, TypeAssertionInspectionResult } from "./types.ts";

/**
 * Creates an inspector that detects suspicious type assertions.
 *
 * @param resultsHandler - Optional custom results handler.
 */
export function createNoTypeAssertionsInspector(
	resultsHandler?: ResultsHandler<TypeAssertionInspectionResult>,
): Inspector<TypeAssertionInspectionResult> {
	return {
		nodeInspectorFactory: createNodeInspectorFactory,
		resultsHandler: resultsHandler ?? defaultResultsHandler,
	};
}
