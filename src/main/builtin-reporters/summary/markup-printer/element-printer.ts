/**
 * Element printing logic for markup elements.
 */

import type { MarkupGeneralElementContent } from "../../../../diagnostics/markup/types.ts";
import type { Printer } from "../../../../reporter/index.ts";
import { printBulletList, printOrderedList } from "./list-printer.ts";
import { printParagraph } from "./paragraph-printer.ts";
import { type PrintContext, shouldAddEmptyLineBefore } from "./spacing.ts";

/**
 * Prints text elements.
 * @package
 */
export function printTextElement(text: string, printer: Printer): void {
	printer.print(text);
}

/**
 * Prints formatting elements (strong, code) by ignoring the formatting and printing content.
 * @package
 */
export function printFormattingElement(
	children: MarkupGeneralElementContent[],
	printer: Printer,
	context: PrintContext,
): void {
	printMarkupChildren(children, printer, context);
}

/**
 * Prints a single markup element using appropriate Printer methods.
 * @package
 */
export function printMarkupElement(
	element: MarkupGeneralElementContent,
	printer: Printer,
	context: PrintContext,
): void {
	if (element.type === "text") {
		printTextElement(element.value, printer);
		return;
	}

	// Add empty line before element if needed
	if (shouldAddEmptyLineBefore(element, context)) {
		printer.newLine();
	}

	switch (element.name) {
		case "paragraph":
			printParagraph(element, printer, context, printMarkupChildren);
			break;

		case "bullet-list":
			printBulletList(element, printer, printMarkupChildren);
			break;

		case "ordered-list":
			printOrderedList(element, printer, printMarkupChildren);
			break;

		case "strong":
		case "code":
			printFormattingElement(element.children, printer, context);
			break;
	}
}

/**
 * Prints an array of markup elements.
 * @package
 */
export function printMarkupChildren(
	children: MarkupGeneralElementContent[],
	printer: Printer,
	context: PrintContext,
): void {
	children.forEach((child, index) => {
		const childContext: PrintContext = {
			...context,
			isFirstElement: index === 0,
		};
		printMarkupElement(child, printer, childContext);
	});
}
