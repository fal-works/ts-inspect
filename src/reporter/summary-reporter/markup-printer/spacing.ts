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
	isLastElement: boolean;
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

	const isStructuralElement =
		element.name === "paragraph" ||
		element.name === "bullet-list" ||
		element.name === "ordered-list";

	if (!isStructuralElement) return false;

	if (context.isInsideListItem) {
		// Inside list-item: newline before nested lists (but not first), no empty lines before paragraphs
		if (
			(element.name === "bullet-list" || element.name === "ordered-list") &&
			!context.isFirstElement
		) {
			return true;
		}
		return false;
	} else {
		// Normal context: empty line before paragraph/list (but not at root level)
		return !context.isFirstElement;
	}
}
