/**
 * Reporter types for formatting inspection results.
 */

import type { Writable } from "node:stream";
import type { InspectorResults } from "../inspector/index.ts";

/**
 * Reporter is a function that formats inspection results to a writable stream.
 */
export type Reporter = (results: InspectorResults, output: Writable) => void;
