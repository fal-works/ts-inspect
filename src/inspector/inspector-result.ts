/**
 * Inspector result types and structures.
 */

import type { Diagnostics } from "../diagnostics/index.ts";

/**
 * Structured result returned by an inspector's ResultsBuilder.
 * Contains all diagnostics found by the inspector plus optional metadata.
 */
export interface InspectorResult {
	/** Unique name identifying the inspector (e.g., "no-type-assertions") */
	inspectorName: string;
	/** Optional summary message describing what was found */
	message?: string | undefined;
	/** Array of diagnostics found by this inspector */
	diagnostics: Diagnostics;
	/** Optional general guidance or best practices from this inspector */
	advices?: string | undefined;
	/** Optional link to detailed documentation about this inspector */
	documentationLink?: string | undefined;
}

/**
 * Array of results from all inspectors that were run.
 * This is the top-level structure passed to reporters for formatting.
 */
export type InspectorResults = InspectorResult[];
