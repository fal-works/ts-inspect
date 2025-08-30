/**
 * Type definitions for the no-type-assertions inspector.
 */

import type { CodeLocation } from "../../../diagnostics/index.ts";

/**
 * List of all type assertion inspection findings.
 */
export type TypeAssertionFindings = Required<CodeLocation>[];
