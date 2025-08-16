/**
 * Collection of built-in inspectors.
 */

import { createNoTypeAssertionsInspector } from "./no-type-assertions.ts";

/**
 * Creates the default list of built-in inspectors.
 */
export function createDefaultInspectors() {
	return [createNoTypeAssertionsInspector()];
}

export { createNoTypeAssertionsInspector as createAsAssertionInspector };
