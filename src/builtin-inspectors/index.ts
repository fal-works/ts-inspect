/**
 * Collection of built-in inspectors.
 */

import { createAsAssertionInspector } from "./as-assertions.ts";

/**
 * Creates the default list of built-in inspectors.
 */
export function createDefaultInspectors() {
	return [createAsAssertionInspector()];
}

export { createAsAssertionInspector };
