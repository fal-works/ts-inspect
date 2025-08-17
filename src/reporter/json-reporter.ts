/**
 * JSON reporter that outputs inspection results as JSON.
 */

import type { Reporter } from "./reporter.ts";

/**
 * Built-in JSON reporter for machine-readable output.
 */
export const jsonReporter: Reporter = (results, output) => {
	output.write(JSON.stringify(results, null, 2));
};
