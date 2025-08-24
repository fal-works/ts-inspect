/**
 * Tests for list printer functions.
 */

import { strictEqual } from "node:assert";
import { describe, it } from "node:test";
import { mockWritable } from "../../../../test/test-utils.ts";
import { createPrinter } from "../../../core/printer.ts";
import { bulletList, listItem, orderedList, text } from "../../../diagnostics/markup/builders.ts";
import type { MarkupGeneralElementContent } from "../../../diagnostics/markup/types.ts";
import {
	printBulletList,
	printListItem,
	printListItemsWithHeader,
	printListItemsWithoutHeader,
	printOrderedList,
} from "./list-printer.ts";
import type { PrintContext } from "./spacing.ts";

describe("reporter/summary-reporter/markup-printer/list-printer", () => {
	const mockPrintChildren = (
		children: MarkupGeneralElementContent[],
		printer: any,
		_context: PrintContext,
	): void => {
		// Simple mock that just prints text content
		children.forEach((child) => {
			if (child.type === "text") {
				printer.print(child.value);
			}
		});
	};

	describe("printListItem", () => {
		it("prints simple list item without nesting", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const item = listItem("Simple item");

			printListItem(item, 0, 1, "- ", printer, mockPrintChildren);

			strictEqual(output.getOutput(), "- Simple item\n");
		});

		it("prints list item with nested elements using groups", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const item = listItem([text("Item with "), bulletList([listItem("nested")])]);

			printListItem(item, 0, 1, "1. ", printer, (children, p, _context) => {
				children.forEach((child) => {
					if (child.type === "text") {
						p.print(child.value);
					} else if (child.type === "element" && child.name === "bullet-list") {
						p.print("nested content");
					}
				});
			});

			// The actual indentation depends on printer group behavior -
			// the key is that it uses groups for nested content
			strictEqual(output.getOutput(), "1. Item with nested content\n");
		});
	});

	describe("printBulletList", () => {
		it("prints bullet list without header", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const list = bulletList([listItem("First"), listItem("Second")]);

			printBulletList(list, printer, mockPrintChildren);

			strictEqual(output.getOutput(), "- First\n- Second\n");
		});

		it("prints bullet list with caption", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const list = bulletList([listItem("First"), listItem("Second")], undefined, "My List");

			printBulletList(list, printer, mockPrintChildren);

			strictEqual(output.getOutput(), "My List:\n  - First\n  - Second\n");
		});

		it("prints bullet list with intention", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const list = bulletList([listItem("Example one"), listItem("Example two")], "examples");

			printBulletList(list, printer, mockPrintChildren);

			strictEqual(output.getOutput(), "Examples:\n  - Example one\n  - Example two\n");
		});
	});

	describe("printOrderedList", () => {
		it("prints ordered list without header", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const list = orderedList([listItem("First"), listItem("Second")]);

			printOrderedList(list, printer, mockPrintChildren);

			strictEqual(output.getOutput(), "1. First\n2. Second\n");
		});

		it("prints ordered list with caption", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const list = orderedList([listItem("First"), listItem("Second")], undefined, "Steps");

			printOrderedList(list, printer, mockPrintChildren);

			strictEqual(output.getOutput(), "Steps:\n  1. First\n  2. Second\n");
		});

		it("prints ordered list with intention", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const list = orderedList(
				[listItem("First step"), listItem("Second step")],
				"stepwise-instructions",
			);

			printOrderedList(list, printer, mockPrintChildren);

			strictEqual(
				output.getOutput(),
				"Stepwise Instructions:\n  1. First step\n  2. Second step\n",
			);
		});
	});

	describe("printListItemsWithHeader", () => {
		it("prints header and list items with indentation", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const items = [{ children: [text("First")] }, { children: [text("Second")] }];
			const prefixGenerator = () => "- ";

			printListItemsWithHeader("My Header", items, prefixGenerator, printer, mockPrintChildren);

			strictEqual(output.getOutput(), "My Header:\n  - First\n  - Second\n");
		});
	});

	describe("printListItemsWithoutHeader", () => {
		it("prints list items without indentation", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const items = [{ children: [text("First")] }, { children: [text("Second")] }];
			const prefixGenerator = (index: number) => `${index + 1}. `;

			printListItemsWithoutHeader(items, prefixGenerator, printer, mockPrintChildren);

			strictEqual(output.getOutput(), "1. First\n2. Second\n");
		});
	});
});
