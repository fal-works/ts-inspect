/**
 * Diagnostic types that organize findings hierarchically to eliminate file path redundancy.
 */

import type { CodeLocation, DiagnosticDetails } from "./common-types.ts";
import type { DetailedFinding, Finding } from "./finding-types.ts";

/**
 * Simple diagnostics pattern where the inspector provides one message
 * that applies to all findings. Most common pattern for straightforward inspectors.
 */
export interface SimpleDiagnostics {
	type: "simple";
	/** Inspector-level message and advice that applies to all findings */
	details: DiagnosticDetails;
	/** Findings organized by file path */
	perFile: Map<string, SimpleDiagnosticsFileScope>;
}

/**
 * Container for all findings within a single file for simple diagnostics.
 */
export interface SimpleDiagnosticsFileScope {
	/** Array of [location, finding] tuples for code-location-specific findings */
	locations: [CodeLocation, Finding][];
}

/**
 * Rich diagnostics pattern where each finding can have its own message
 * and advice. Used for complex analysis with varied finding types.
 */
export interface RichDiagnostics {
	type: "rich";
	/** Project-level findings (architecture, dependencies, etc.) */
	project: DetailedFinding[];
	/** Findings organized by file path */
	perFile: Map<string, RichDiagnosticsFileScope>;
}

/**
 * Container for all findings within a single file for rich diagnostics.
 */
export interface RichDiagnosticsFileScope {
	/** Findings that apply to the entire file */
	wholeFile: DetailedFinding[];
	/** Array of [location, finding] tuples for code-location-specific findings */
	locations: [CodeLocation, DetailedFinding][];
}

/**
 * Union type representing either simple or rich diagnostic patterns.
 * Inspectors choose between these based on their complexity needs.
 */
export type Diagnostics = SimpleDiagnostics | RichDiagnostics;
