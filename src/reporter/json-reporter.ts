/**
 * JSON reporter that outputs inspection results as JSON.
 */

import type { Reporter } from "./reporter.ts";

/**
 * JSON reporter for machine-readable output.
 */
export const jsonReporter: Reporter = (results) => {
	return JSON.stringify(results, null, 2);
};
