/**
 * Formatting utilities for summary reporter.
 */

/**
 * Formats a code snippet for display, handling multiline snippets properly.
 *
 * - Converts tabs to 4 spaces
 * - Right-trims whitespace from all lines
 * - For multiline snippets, removes minimum indentation from subsequent lines while preserving relative indentation
 */
export function formatCodeSnippet(snippet: string): string {
	// Convert tabs to 4 spaces and right-trim each line
	const cleansedSnippet = snippet
		.replace(/\t/g, "    ")
		.split("\n")
		.map((line) => line.trimEnd())
		.join("\n");

	const lines = cleansedSnippet.split("\n");
	if (lines.length <= 1) {
		return cleansedSnippet;
	}

	// Find minimum indentation from lines 2 onwards (excluding first line)
	// Only consider lines that have some indentation (> 0 spaces)
	const remainingLines = lines.slice(1);
	let minIndent = Number.POSITIVE_INFINITY;

	for (const line of remainingLines) {
		if (line.length === 0) continue; // Skip empty lines (already right-trimmed)
		const leadingSpaces = line.match(/^(\s*)/)?.[1]?.length ?? 0;
		if (leadingSpaces > 0) {
			minIndent = Math.min(minIndent, leadingSpaces);
		}
	}

	// If no lines with indentation found, return the cleansed snippet
	if (minIndent === Number.POSITIVE_INFINITY) {
		return cleansedSnippet;
	}

	// Remove minimum indentation from lines that have at least that much indentation
	const formattedLines = [
		lines[0], // First line unchanged
		...remainingLines.map((line) => {
			if (line.length === 0) return line; // Empty lines unchanged (already right-trimmed)
			const leadingSpaces = line.match(/^(\s*)/)?.[1]?.length ?? 0;
			return leadingSpaces >= minIndent ? line.slice(minIndent) : line;
		}),
	];

	return formattedLines.join("\n");
}
