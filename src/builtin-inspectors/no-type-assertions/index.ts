/**
 * No-type-assertions inspector - detects suspicious type assertions.
 */

import type { Inspector } from "../../inspector/index.ts";
import { nodeInspectorFactory } from "./node-inspector.ts";
import { resultsBuilder } from "./results-builder.ts";
import type { TypeAssertionFindings } from "./types.ts";

export type { TypeAssertionFindings } from "./types.ts";

/**
 * Creates an inspector that detects suspicious type assertions.
 */
export function createNoTypeAssertionsInspector(): Inspector<TypeAssertionFindings> {
	return {
		name: "no-type-assertions",
		nodeInspectorFactory,
		resultsBuilder,
	};
}
