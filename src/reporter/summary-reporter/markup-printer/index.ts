/**
 * Console-specific markup rendering using Printer infrastructure.
 */

import type { Printer } from "../../../core/printer.ts";
import type { MarkupRootElement } from "../../../diagnostics/markup/types.ts";
import { printMarkupChildren } from "./element-printer.ts";

/**
 * Prints markup document to console using the Printer's formatting capabilities.
 */
export function printMarkup(markup: MarkupRootElement, printer: Printer): void {
	// Root markup element: no empty lines before/after
	printMarkupChildren(markup.children, printer, {
		isInsideListItem: false,
		isFirstElement: true,
		isLastElement: true,
	});
}
