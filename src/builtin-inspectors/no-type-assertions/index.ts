/**
 * No-type-assertions inspector - detects suspicious type assertions.
 */

import type { Inspector, ResultsBuilder } from "../../inspector/index.ts";
import { createNodeInspectorFactory } from "./node-inspector.ts";
import { defaultResultsBuilder } from "./results-builder.ts";
import type { TypeAssertionFindings } from "./types.ts";

export type { TypeAssertionFinding, TypeAssertionFindings } from "./types.ts";

/**
 * Creates an inspector that detects suspicious type assertions.
 *
 * @param resultsBuilder - Optional custom results builder.
 */
export function createNoTypeAssertionsInspector(
	resultsBuilder?: ResultsBuilder<TypeAssertionFindings>,
): Inspector<TypeAssertionFindings> {
	return {
		name: "no-type-assertions",
		nodeInspectorFactory: createNodeInspectorFactory,
		resultsBuilder: resultsBuilder ?? defaultResultsBuilder,
	};
}
