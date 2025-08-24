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
		// Inside list-item: empty line before paragraph (but not first), newline before lists (but not first)
		if (element.name === "paragraph") {
			return !context.isFirstElement;
		}
		// Add newline before nested lists (but not if it's the first element)
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

/**
 * Determines if empty line should be added after element.
 * @package
 */
export function shouldAddEmptyLineAfter(
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
		// Inside list-item: empty line after paragraph only if it's the last element
		if (element.name === "paragraph" && context.isLastElement) {
			return true;
		}
		return false;
	} else {
		// Normal context: no additional empty lines after (spacing handled by before logic)
		return false;
	}
}
