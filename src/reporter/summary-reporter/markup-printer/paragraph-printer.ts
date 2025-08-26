/**
 * Paragraph printing functions for markup elements.
 */

import type { Printer } from "../../../core/printer.ts";
import type {
	MarkupGeneralElementContent,
	MarkupParagraphElement,
} from "../../../diagnostics/markup/types.ts";
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
 * Prints a paragraph with header indentation.
 * @package
 */
export function printParagraphWithHeader(
	header: string,
	children: MarkupGeneralElementContent[],
	printer: Printer,
	context: PrintContext,
	printChildren: PrintChildrenFunction,
): void {
	printer.println(`${header}:`);
	printChildren(children, printer, {
		isInsideListItem: context.isInsideListItem,
		isFirstElement: true,
		isLastElement: true,
	});
	printer.newLine();
}

/**
 * Prints a paragraph without header.
 * @package
 */
export function printParagraphWithoutHeader(
	children: MarkupGeneralElementContent[],
	printer: Printer,
	context: PrintContext,
	printChildren: PrintChildrenFunction,
): void {
	printChildren(children, printer, {
		isInsideListItem: context.isInsideListItem,
		isFirstElement: true,
		isLastElement: true,
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

	if (header) {
		printParagraphWithHeader(header, element.children, printer, context, printChildren);
	} else {
		printParagraphWithoutHeader(element.children, printer, context, printChildren);
	}
}
