/**
 * Raw JSON reporter that outputs inspection results as JSON without any conversion.
 */

import type { Reporter } from "./reporter.ts";

/**
 * Built-in reporter that outputs inspection results as JSON without any conversion.
 */
export const rawJsonReporter: Reporter = (results, output) => {
	output.write(JSON.stringify(results));
};
