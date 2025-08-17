/**
 * No-type-assertions inspector - detects suspicious type assertions.
 */

import type { Inspector, ResultsBuilder } from "../../inspector/index.ts";
import { createNodeInspectorFactory } from "./node-inspector.ts";
import { defaultResultsBuilder } from "./results-builder.ts";
import type { TypeAssertionInspectionResult } from "./types.ts";

export type { TypeAssertionFinding, TypeAssertionInspectionResult } from "./types.ts";

/**
 * Creates an inspector that detects suspicious type assertions.
 *
 * @param resultsBuilder - Optional custom results builder.
 */
export function createNoTypeAssertionsInspector(
	resultsBuilder?: ResultsBuilder<TypeAssertionInspectionResult>,
): Inspector<TypeAssertionInspectionResult> {
	return {
		name: "no-type-assertions",
		nodeInspectorFactory: createNodeInspectorFactory,
		resultsBuilder: resultsBuilder ?? defaultResultsBuilder,
	};
}
