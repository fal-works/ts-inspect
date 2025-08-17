/**
 * Diagnostic types for inspection results.
 */

/**
 * Severity levels for diagnostics.
 * - `error`: Issues that should be fixed (causes exit code 1)
 * - `warning`: Issues that should be reviewed but don't cause failure (exit code 0)
 * - `info`: Informational notices (exit code 0)
 */
export type DiagnosticSeverity = "error" | "warning" | "info";

/**
 * Base properties shared by all diagnostic types.
 */
interface DiagnosticBase {
	/** Severity level of the diagnostic */
	severity: DiagnosticSeverity;
}

/**
 * Base interface for diagnostics that reference a specific file location.
 * Used by both simple and rich location diagnostics.
 */
interface LocationDiagnosticBase extends DiagnosticBase {
	/** Relative path from current working directory */
	file: string;
	/** 1-based line number where the issue occurs */
	line: number;
	/** Optional code snippet showing the problematic expression */
	snippet?: string | undefined;
}

/**
 * Simple location diagnostic for single-line issues.
 * The diagnostic message is provided at the inspector level, not per diagnostic.
 * Use this when all diagnostics from an inspector have the same meaning.
 */
export interface SimpleLocationDiagnostic extends LocationDiagnosticBase {
	/** Discriminant value for classifying the diagnostic type */
	type: "location-simple";
}

/**
 * Rich location diagnostic for multi-line issues with individual messages.
 * Each diagnostic can have its own message and advice.
 * Use this when diagnostics need different explanations or guidance.
 */
export interface RichLocationDiagnostic extends LocationDiagnosticBase {
	/** Discriminant value for classifying the diagnostic type */
	type: "location-rich";
	/** Specific message for this diagnostic */
	message: string;
	/** Optional advice specific to this diagnostic */
	advices?: string | undefined;
}

/**
 * Module-level diagnostic for file-wide issues.
 * Use this when the issue affects the entire file but isn't tied to a specific line.
 */
export interface ModuleDiagnostic extends DiagnosticBase {
	/** Discriminant value for classifying the diagnostic type */
	type: "module";
	/** Relative path from current working directory */
	file: string;
	/** Description of the module-level issue */
	message: string;
}

/**
 * Project-level diagnostic for project-wide issues.
 * Use this for issues like dependency analysis, architecture violations, etc.
 */
export interface ProjectDiagnostic extends DiagnosticBase {
	/** Discriminant value for classifying the diagnostic type */
	type: "project";
	/** Description of the project-level issue */
	message: string;
}

/**
 * Array of simple location diagnostics.
 * Use this pattern when all diagnostics have the same meaning and the
 * inspector provides a single message/advice for all of them.
 */
export type SimpleDiagnostics = SimpleLocationDiagnostic[];

/**
 * Array of mixed rich diagnostics.
 * Use this pattern when diagnostics need individual messages or when
 * combining different diagnostic types (location, module, project).
 */
export type RichDiagnostics = (RichLocationDiagnostic | ModuleDiagnostic | ProjectDiagnostic)[];

/**
 * Union type representing either simple or rich diagnostic patterns.
 * Inspectors choose between these two patterns based on their needs.
 */
export type Diagnostics = SimpleDiagnostics | RichDiagnostics;

/**
 * Helper type to extract individual diagnostic items from the Diagnostics union.
 * Useful for generic processing of diagnostic arrays.
 */
export type DiagnosticItem =
	| SimpleLocationDiagnostic
	| RichLocationDiagnostic
	| ModuleDiagnostic
	| ProjectDiagnostic;

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

/**
 * Mapping from severity code to precedence order.
 */
const severityOrder: Record<DiagnosticSeverity, number> = { error: 2, warning: 1, info: 0 };

/**
 * Detects the worst severity from diagnostics.
 * Returns null if no diagnostics (treated as success).
 */
export function getWorstSeverity(diagnostics: Diagnostics): DiagnosticSeverity | null {
	const items: DiagnosticItem[] = diagnostics;
	if (items.length === 0) return null;

	let worst: DiagnosticSeverity = items[0].severity;
	for (let i = 1; i < items.length; i++) {
		const current = items[i].severity;
		if (severityOrder[current] > severityOrder[worst]) {
			worst = current;
		}
	}

	return worst;
}

/**
 * Translates severity to exit code.
 */
export function translateSeverityToExitCode(severity: DiagnosticSeverity | null): 0 | 1 {
	return severity === "error" ? 1 : 0;
}

/**
 * Gets worst severity from all inspector results.
 */
export function getOverallWorstSeverity(results: InspectorResults): DiagnosticSeverity | null {
	const severities = results
		.map((r) => getWorstSeverity(r.diagnostics))
		.filter((s): s is DiagnosticSeverity => s !== null);

	if (severities.length === 0) return null;

	const severityOrder = { error: 2, warning: 1, info: 0 };
	return severities.reduce((max, current) =>
		severityOrder[current] > severityOrder[max] ? current : max,
	);
}
