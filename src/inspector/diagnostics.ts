/**
 * Diagnostic types for inspection results.
 */

import type { DiagnosticSeverity } from "./severity.ts";

export { getOverallWorstSeverity, getWorstSeverity } from "./diagnostics-tools.ts";

// Base interfaces

/**
 * Base properties shared by all diagnostic types.
 */
interface DiagnosticBase {
	/** Severity level of the diagnostic */
	severity: DiagnosticSeverity;
}

/**
 * Base properties for rich diagnostics with individual messages and advice.
 */
interface RichDiagnosticBase {
	/** Specific message for this diagnostic */
	message: string;
	/** Optional advice specific to this diagnostic */
	advices?: string | undefined;
}

/**
 * Base interface for diagnostics that reference a specific file location.
 * Used by both simple and rich location diagnostics.
 */
interface LocationDiagnosticBase extends DiagnosticBase {
	/** Discriminant value for classifying the diagnostic type */
	type: "location";
	/** Relative path from current working directory */
	file: string;
	/** 1-based line number where the issue occurs */
	line: number;
	/** Optional code snippet showing the problematic expression */
	snippet?: string | undefined;
}

/**
 * Base interface for module-level diagnostics.
 * Use this when the issue affects the entire file but isn't tied to a specific line.
 */
interface ModuleDiagnosticBase extends DiagnosticBase {
	/** Discriminant value for classifying the diagnostic type */
	type: "module";
	/** Relative path from current working directory */
	file: string;
}

/**
 * Base interface for project-level diagnostics.
 * Use this for issues like dependency analysis, architecture violations, etc.
 */
interface ProjectDiagnosticBase extends DiagnosticBase {
	/** Discriminant value for classifying the diagnostic type */
	type: "project";
}

// Simple diagnostic interfaces

/**
 * Simple location diagnostic for condensed reporting.
 * The diagnostic message is provided at the inspector level, not per diagnostic.
 * Use this when all diagnostics from an inspector have the same meaning.
 */
export interface SimpleLocationDiagnostic extends LocationDiagnosticBase {}

/**
 * Simple module-level diagnostic for condensed reporting.
 * Use this when the issue affects the entire file but isn't tied to a specific line.
 */
export interface SimpleModuleDiagnostic extends ModuleDiagnosticBase {}

/**
 * Simple project-level diagnostic for condensed reporting.
 * Use this for issues like dependency analysis, architecture violations, etc.
 */
export interface SimpleProjectDiagnostic extends ProjectDiagnosticBase {}

// Rich diagnostic interfaces

/**
 * Rich location diagnostic with individual messages.
 * Each diagnostic can have its own message and advice.
 * Use this when diagnostics need different explanations or guidance.
 */
export interface RichLocationDiagnostic extends LocationDiagnosticBase, RichDiagnosticBase {}

/**
 * Rich module-level diagnostic with individual message.
 * Use this when the issue affects the entire file but isn't tied to a specific line.
 */
export interface RichModuleDiagnostic extends ModuleDiagnosticBase, RichDiagnosticBase {}

/**
 * Rich project-level diagnostic with individual message.
 * Use this for issues like dependency analysis, architecture violations, etc.
 */
export interface RichProjectDiagnostic extends ProjectDiagnosticBase, RichDiagnosticBase {}

// Union types for diagnostic collections

/**
 * Simple diagnostic items without individual messages.
 * The inspector provides the overall message/advice for all items.
 */
export type SimpleDiagnostic =
	| SimpleLocationDiagnostic
	| SimpleModuleDiagnostic
	| SimpleProjectDiagnostic;

/**
 * Rich diagnostic items with individual messages and optional advice.
 * Each item has its own specific message and guidance.
 */
export type RichDiagnostic = RichLocationDiagnostic | RichModuleDiagnostic | RichProjectDiagnostic;

/**
 * Helper type to extract individual diagnostic items from the Diagnostics union.
 * Useful for generic processing of diagnostic arrays.
 */
export type Diagnostic = SimpleDiagnostic | RichDiagnostic;

// Diagnostic pattern interfaces

/**
 * Simple diagnostics pattern for condensed reporting.
 * Use this when all diagnostics have the same meaning and the
 * inspector provides a single message/advice for all of them.
 */
export interface SimpleDiagnostics {
	/** Discriminant value for the diagnostic pattern */
	type: "simple";
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
