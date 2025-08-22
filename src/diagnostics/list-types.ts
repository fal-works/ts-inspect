/**
 * Diagnostic collection and pattern type definitions.
 */

import type { DiagnosticDetails } from "./common-types.ts";
import type { RichDiagnostic, SimpleDiagnostic } from "./item-types.ts";

/**
 * Simple diagnostics pattern for condensed reporting.
 * Use this when all diagnostics have the same meaning and the
 * inspector provides a single message/advice for all of them.
 */
export interface SimpleDiagnostics {
	/** Discriminant value for the diagnostic pattern */
	type: "simple";
	/** Diagnostic message and advice details that apply to all items */
	details: DiagnosticDetails;
	/** Array of simple diagnostic items */
	items: SimpleDiagnostic[];
}

/**
 * Rich diagnostics pattern for detailed reporting.
 * Use this when diagnostics need individual messages or when
 * combining different diagnostic types with specific guidance.
 */
export interface RichDiagnostics {
	/** Discriminant value for the diagnostic pattern */
	type: "rich";
	/** Array of rich diagnostic items */
	items: RichDiagnostic[];
}

/**
 * Union type representing either simple or rich diagnostic patterns.
 * Inspectors choose between these two patterns based on their needs.
 */
export type Diagnostics = SimpleDiagnostics | RichDiagnostics;
