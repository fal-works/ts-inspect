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
 * Prints list items with optional header.
 * @package
 */
export function printListItems(
	items: { children: MarkupGeneralElementContent[] }[],
	prefixGenerator: (index: number) => string,
	printer: Printer,
	printChildren: PrintChildrenFunction,
	indentLevels: number,
	header?: string,
): void {
	if (header) {
		printer.println(`${header}:`);
	}
	items.forEach((item, index) => {
		const prefix = prefixGenerator(index);
		printListItem(item, index, prefix, printer, printChildren, indentLevels);
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

	printListItems(element.children, prefixGenerator, printer, printChildren, 1, header);
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

	const prefixGenerator = (index: number) => {
		const number = (index + 1).toString();
		return `${number}. `.padStart(4, " ");
	};

	printListItems(element.children, prefixGenerator, printer, printChildren, 2, header);
}
