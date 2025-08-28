/**
 * Paragraph printing functions for markup elements.
 */

import type {
	MarkupGeneralElementContent,
	MarkupParagraphElement,
} from "../../../diagnostics/markup/types.ts";
import type { Printer } from "../../../printer/printer.ts";
import type { PrintContext } from "./spacing.ts";
import { intentionToString } from "./utils.ts";

/**
 * Type for the children printing function to avoid circular dependency.
 */
type PrintChildrenFunction = (
	children: MarkupGeneralElementContent[],
	printer: Printer,
	context: PrintContext,
) => void;

/**
 * Prints paragraph content with optional header.
 * @package
 */
export function printParagraphContent(
	children: MarkupGeneralElementContent[],
	printer: Printer,
	context: PrintContext,
	printChildren: PrintChildrenFunction,
	header?: string,
): void {
	if (header) {
		printer.println(`${header}:`);
	}
	printChildren(children, printer, {
		isInsideListItem: context.isInsideListItem,
		isFirstElement: true,
	});
	printer.newLine();
}

/**
 * Prints a paragraph element.
 * @package
 */
export function printParagraph(
	element: MarkupParagraphElement,
	printer: Printer,
	context: PrintContext,
	printChildren: PrintChildrenFunction,
): void {
	const { caption, intention } = element.attributes;
	const header = caption || (intention && intentionToString(intention));

	printParagraphContent(element.children, printer, context, printChildren, header);
}
