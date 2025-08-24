/**
 * Utility functions for markup printing.
 */

import type { MarkupGeneralElementContent } from "../../../diagnostics/markup/types.ts";

/**
 * Converts kebab-case intention to Title Case.
 * @package
 */
export function intentionToString(intention: string): string {
	return intention
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Checks if a list of markup elements contains any non-text elements (like paragraphs, lists).
 * @package
 */
export function hasNonTextElements(children: MarkupGeneralElementContent[]): boolean {
	return children.some(
		(child) =>
			child.type === "element" &&
			(child.name === "paragraph" || child.name === "bullet-list" || child.name === "ordered-list"),
	);
}
