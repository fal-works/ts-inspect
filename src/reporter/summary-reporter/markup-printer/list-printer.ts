/**
 * List printing functions for markup elements.
 */

import type { Printer } from "../../../core/printer.ts";
import type {
	MarkupBulletListElement,
	MarkupGeneralElementContent,
	MarkupOrderedListElement,
} from "../../../diagnostics/markup/types.ts";
import type { PrintContext } from "./spacing.ts";
import { hasNonTextElements, intentionToString } from "./utils.ts";

/**
 * Type for the children printing function to avoid circular dependency.
 */
type PrintChildrenFunction = (
	children: MarkupGeneralElementContent[],
	printer: Printer,
	context: PrintContext,
) => void;

/**
 * Prints a single list item with appropriate indentation.
 * @package
 */
export function printListItem(
	item: { children: MarkupGeneralElementContent[] },
	index: number,
	totalItems: number,
	prefix: string,
	printer: Printer,
	printChildren: PrintChildrenFunction,
): void {
	printer.print(prefix);
	const hasNestedElements = hasNonTextElements(item.children);
	if (hasNestedElements) {
		printer.group();
		printChildren(item.children, printer, {
			isInsideListItem: true,
			isFirstElement: index === 0,
			isLastElement: index === totalItems - 1,
		});
		printer.groupEnd();
	} else {
		printChildren(item.children, printer, {
			isInsideListItem: true,
			isFirstElement: index === 0,
			isLastElement: index === totalItems - 1,
		});
		printer.newLine();
	}
}

/**
 * Prints list items with header.
 * @package
 */
export function printListItemsWithHeader(
	header: string,
	items: { children: MarkupGeneralElementContent[] }[],
	prefixGenerator: (index: number) => string,
	printer: Printer,
	printChildren: PrintChildrenFunction,
): void {
	printer.println(`${header}:`);
	printer.group();
	items.forEach((item, index) => {
		const prefix = prefixGenerator(index);
		printListItem(item, index, items.length, prefix, printer, printChildren);
	});
	printer.groupEnd();
}

/**
 * Prints list items without header indentation.
 * @package
 */
export function printListItemsWithoutHeader(
	items: { children: MarkupGeneralElementContent[] }[],
	prefixGenerator: (index: number) => string,
	printer: Printer,
	printChildren: PrintChildrenFunction,
): void {
	items.forEach((item, index) => {
		const prefix = prefixGenerator(index);
		printListItem(item, index, items.length, prefix, printer, printChildren);
	});
}

/**
 * Prints a bullet list element.
 * @package
 */
export function printBulletList(
	element: MarkupBulletListElement,
	printer: Printer,
	printChildren: PrintChildrenFunction,
): void {
	const { caption, intention } = element.attributes;
	const header = caption || (intention && intentionToString(intention));
	const prefixGenerator = () => "- ";

	if (header) {
		printListItemsWithHeader(header, element.children, prefixGenerator, printer, printChildren);
	} else {
		printListItemsWithoutHeader(element.children, prefixGenerator, printer, printChildren);
	}
}

/**
 * Prints an ordered list element.
 * @package
 */
export function printOrderedList(
	element: MarkupOrderedListElement,
	printer: Printer,
	printChildren: PrintChildrenFunction,
): void {
	const { caption, intention } = element.attributes;
	const header = caption || (intention && intentionToString(intention));
	const prefixGenerator = (index: number) => `${index + 1}. `;

	if (header) {
		printListItemsWithHeader(header, element.children, prefixGenerator, printer, printChildren);
	} else {
		printListItemsWithoutHeader(element.children, prefixGenerator, printer, printChildren);
	}
}
