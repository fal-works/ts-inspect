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
	indentLevels: number,
): void {
	printer.print(prefix);
	// Apply the correct indentation for subsequent lines
	for (let i = 0; i < indentLevels; i++) {
		printer.indent();
	}

	printChildren(item.children, printer, {
		isInsideListItem: true,
		isFirstElement: index === 0,
		isLastElement: index === totalItems - 1,
	});

	// Add newline for simple text content (nested elements handle their own spacing)
	const hasNestedElements = hasNonTextElements(item.children);
	if (!hasNestedElements) {
		printer.newLine();
	}

	// Restore indentation level
	for (let i = 0; i < indentLevels; i++) {
		printer.dedent();
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
	indentLevels: number,
): void {
	printer.println(`${header}:`);
	items.forEach((item, index) => {
		const prefix = prefixGenerator(index);
		printListItem(item, index, items.length, prefix, printer, printChildren, indentLevels);
	});
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
	indentLevels: number,
): void {
	items.forEach((item, index) => {
		const prefix = prefixGenerator(index);
		printListItem(item, index, items.length, prefix, printer, printChildren, indentLevels);
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
		printListItemsWithHeader(header, element.children, prefixGenerator, printer, printChildren, 1);
	} else {
		printListItemsWithoutHeader(element.children, prefixGenerator, printer, printChildren, 1);
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
		printListItemsWithHeader(header, element.children, prefixGenerator, printer, printChildren, 2);
	} else {
		printListItemsWithoutHeader(element.children, prefixGenerator, printer, printChildren, 2);
	}
}
