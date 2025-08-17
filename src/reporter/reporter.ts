/**
 * Reporter types for formatting inspection results.
 */

import type { InspectorResults } from "../inspector/index.ts";

/**
 * Reporter is a function that formats inspection results for output.
 */
export type Reporter = (results: InspectorResults) => string;
