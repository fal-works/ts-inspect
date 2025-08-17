/**
 * Type definitions for the no-type-assertions inspector.
 */

/**
 * Represents a type assertion finding with location and code snippet.
 */
export type TypeAssertionFinding = {
	/**
	 * The line number where the assertion occurs (1-based).
	 */
	line: number;

	/**
	 * The code snippet where the assertion occurs.
	 */
	snippet: string;
};

/**
 * List of all type assertion inspection findings.
 */
export type TypeAssertionFindings = TypeAssertionFinding[];
