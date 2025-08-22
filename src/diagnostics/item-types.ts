/**
 * Individual diagnostic item type definitions.
 */

import type { CodeLocation, DiagnosticDetails, DiagnosticSeverity } from "./common-types.ts";

/**
 * Base properties shared by all diagnostic types.
 */
interface DiagnosticBase {
	/** Severity level of the diagnostic */
	severity: DiagnosticSeverity;
}

/**
 * Extension properties for rich diagnostics with individual messages and advice.
 */
interface RichDiagnosticExtension {
	/** Diagnostic message and advice details */
	details: DiagnosticDetails;
}

// Base diagnostic types (these are the "simple" diagnostics)

/**
 * Location diagnostic that references a specific file location.
 * Use this when all diagnostics from an inspector have the same meaning.
 */
export interface LocationDiagnostic extends DiagnosticBase {
	/** Discriminant value for classifying the diagnostic type */
	type: "location";
	/** Relative path from current working directory */
	file: string;
	/** Location information for the diagnostic */
	location: CodeLocation;
}

/**
 * File-level diagnostic.
 * Use this when the issue affects the entire file but isn't tied to a specific line.
 */
export interface FileDiagnostic extends DiagnosticBase {
	/** Discriminant value for classifying the diagnostic type */
	type: "file";
	/** Relative path from current working directory */
	file: string;
}

// Rich diagnostic types (extensions of base types)

/**
 * Rich location diagnostic with individual messages.
 * Each diagnostic can have its own message and advice.
 * Use this when diagnostics need different explanations or guidance.
 */
export interface RichLocationDiagnostic extends LocationDiagnostic, RichDiagnosticExtension {}

/**
 * Rich file-level diagnostic with individual message.
 * Use this when the issue affects the entire file but isn't tied to a specific line.
 */
export interface RichFileDiagnostic extends FileDiagnostic, RichDiagnosticExtension {}

/**
 * Project-level diagnostic with individual message.
 * Use this for issues like dependency analysis, architecture violations, etc.
 */
export interface ProjectDiagnostic extends DiagnosticBase, RichDiagnosticExtension {
	/** Discriminant value for classifying the diagnostic type */
	type: "project";
}

// Union types for diagnostic collections

/**
 * Simple diagnostic items without individual messages.
 * The inspector provides the overall message/advice for all items.
 */
export type SimpleDiagnostic = LocationDiagnostic | FileDiagnostic;

/**
 * Rich diagnostic items with individual messages and optional advice.
 * Each item has its own specific message and guidance.
 */
export type RichDiagnostic = RichLocationDiagnostic | RichFileDiagnostic | ProjectDiagnostic;

/**
 * Helper type to extract individual diagnostic items from the Diagnostics union.
 * Useful for generic processing of diagnostic arrays.
 */
export type Diagnostic = SimpleDiagnostic | RichDiagnostic;
