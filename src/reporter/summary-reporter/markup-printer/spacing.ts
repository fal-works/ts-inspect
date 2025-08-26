/**
 * HTML-like spacing logic for markup elements.
 */

import type { MarkupGeneralElementContent } from "../../../diagnostics/markup/types.ts";

/**
 * Context information for HTML-like printing behavior.
 * @package
 */
export interface PrintContext {
	isInsideListItem: boolean;
	isFirstElement: boolean;
}

/**
 * Determines if empty line should be added before element.
 * @package
 */
export function shouldAddEmptyLineBefore(
	element: MarkupGeneralElementContent,
	context: PrintContext,
): boolean {
	if (element.type === "text") return false;

	// Only structural elements (paragraph, lists) need spacing considerations
	if (
		element.name !== "paragraph" &&
		element.name !== "bullet-list" &&
		element.name !== "ordered-list"
	) {
		return false;
	}

	if (context.isInsideListItem) {
		// Inside list-item: newline before nested lists (but not first), no empty lines before paragraphs
		return (
			(element.name === "bullet-list" || element.name === "ordered-list") && !context.isFirstElement
		);
	} else {
		// Normal context: empty line before paragraph/list (but not at root level)
		return !context.isFirstElement;
	}
}
