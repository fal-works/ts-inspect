/**
 * Common types shared across the diagnostics system.
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
 * Common structure for diagnostic messages and advice.
 * Shared by both simple diagnostics and rich diagnostic extensions.
 */
export interface DiagnosticDetails {
	/** Message describing the diagnostic */
	message: string;
	/** Optional advice or guidance for addressing the issue */
	advices?: string | undefined;
}
