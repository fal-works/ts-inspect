/**
 * Individual diagnostic item type definitions.
 */

/**
 * Severity levels for diagnostics.
 * - `error`: Issues that should be fixed (causes exit code 1)
 * - `warning`: Issues that should be reviewed but don't cause failure (exit code 0)
 * - `info`: Informational notices (exit code 0)
 */
export type DiagnosticSeverity = "error" | "warning" | "info";

/**
 * Location information for diagnostics that reference specific code positions in a source file.
 * Useful for building location-based diagnostics in custom results builders.
 * 
 * For simplicity, it only includes the start line number and not the precise character range.
 */
export interface CodeLocation {
	/** 1-based line number where the issue occurs */
	line: number;
	/** Optional code snippet showing the problematic expression */
	snippet?: string | undefined;
}

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
	/** Specific message for this diagnostic */
	message: string;
	/** Optional advice specific to this diagnostic */
	advices?: string | undefined;
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
 * Module-level diagnostic.
 * Use this when the issue affects the entire file but isn't tied to a specific line.
 */
export interface ModuleDiagnostic extends DiagnosticBase {
	/** Discriminant value for classifying the diagnostic type */
	type: "module";
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
 * Rich module-level diagnostic with individual message.
 * Use this when the issue affects the entire file but isn't tied to a specific line.
 */
export interface RichModuleDiagnostic extends ModuleDiagnostic, RichDiagnosticExtension {}

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
export type SimpleDiagnostic = LocationDiagnostic | ModuleDiagnostic;

/**
 * Rich diagnostic items with individual messages and optional advice.
 * Each item has its own specific message and guidance.
 */
export type RichDiagnostic = RichLocationDiagnostic | RichModuleDiagnostic | ProjectDiagnostic;

/**
 * Helper type to extract individual diagnostic items from the Diagnostics union.
 * Useful for generic processing of diagnostic arrays.
 */
export type Diagnostic = SimpleDiagnostic | RichDiagnostic;
