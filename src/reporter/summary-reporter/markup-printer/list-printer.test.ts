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
	printListItems,
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

			printListItem(item, 0, 1, "- ", printer, mockPrintChildren, 1);

			strictEqual(output.getOutput(), "- Simple item\n");
		});

		it("prints list item with nested elements using groups", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const item = listItem([text("Item with "), bulletList([listItem("nested")])]);

			printListItem(
				item,
				0,
				1,
				" 1. ",
				printer,
				(children, p, _context) => {
					children.forEach((child) => {
						if (child.type === "text") {
							p.print(child.value);
						} else if (child.type === "element" && child.name === "bullet-list") {
							p.print("nested content");
						}
					});
				},
				2,
			);

			// The actual output depends on how nested content is handled -
			// nested elements handle their own spacing
			strictEqual(output.getOutput(), " 1. Item with nested content");
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

			strictEqual(output.getOutput(), "My List:\n- First\n- Second\n");
		});

		it("prints bullet list with intention", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const list = bulletList([listItem("Example one"), listItem("Example two")], "examples");

			printBulletList(list, printer, mockPrintChildren);

			strictEqual(output.getOutput(), "Examples:\n- Example one\n- Example two\n");
		});
	});

	describe("printOrderedList", () => {
		it("prints ordered list without header", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const list = orderedList([listItem("First"), listItem("Second")]);

			printOrderedList(list, printer, mockPrintChildren);

			strictEqual(output.getOutput(), " 1. First\n 2. Second\n");
		});

		it("prints ordered list with caption", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const list = orderedList([listItem("First"), listItem("Second")], undefined, "Steps");

			printOrderedList(list, printer, mockPrintChildren);

			strictEqual(output.getOutput(), "Steps:\n 1. First\n 2. Second\n");
		});

		it("prints ordered list with intention", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const list = orderedList(
				[listItem("First step"), listItem("Second step")],
				"stepwise-instructions",
			);

			printOrderedList(list, printer, mockPrintChildren);

			strictEqual(output.getOutput(), "Stepwise Instructions:\n 1. First step\n 2. Second step\n");
		});
	});

	describe("printListItems", () => {
		it("prints list items with header at same indentation level", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const items = [{ children: [text("First")] }, { children: [text("Second")] }];
			const prefixGenerator = () => "- ";

			printListItems(items, prefixGenerator, printer, mockPrintChildren, 1, "My Header");

			strictEqual(output.getOutput(), "My Header:\n- First\n- Second\n");
		});

		it("prints list items without header when no header provided", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const items = [{ children: [text("First")] }, { children: [text("Second")] }];
			const prefixGenerator = (index: number) => `${index + 1}. `;

			printListItems(items, prefixGenerator, printer, mockPrintChildren, 2);

			strictEqual(output.getOutput(), "1. First\n2. Second\n");
		});
	});

	describe("multiline list items", () => {
		const multilinePrintChildren = (
			children: MarkupGeneralElementContent[],
			printer: any,
			_context: PrintContext,
		): void => {
			children.forEach((child) => {
				if (child.type === "text") {
					printer.print(child.value);
				}
			});
		};

		it("prints bullet list item with multiline text properly indented", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const item = listItem("First line\nSecond line\nThird line");

			printListItem(item, 0, 1, "- ", printer, multilinePrintChildren, 1);

			strictEqual(output.getOutput(), "- First line\n  Second line\n  Third line\n");
		});

		it("prints ordered list item with multiline text properly indented", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const item = listItem("First line\nSecond line\nThird line");

			printListItem(item, 0, 1, " 1. ", printer, multilinePrintChildren, 2);

			strictEqual(output.getOutput(), " 1. First line\n    Second line\n    Third line\n");
		});

		it("handles multiple multiline bullet list items", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const list = bulletList([
				listItem("Item 1\nContinued on line 2"),
				listItem("Item 2\nAlso multiline\nWith third line"),
			]);

			printBulletList(list, printer, multilinePrintChildren);

			strictEqual(
				output.getOutput(),
				"- Item 1\n  Continued on line 2\n- Item 2\n  Also multiline\n  With third line\n",
			);
		});

		it("handles multiple multiline ordered list items", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const list = orderedList([
				listItem("Step 1\nWith details"),
				listItem("Step 2\nMore details\nEven more"),
			]);

			printOrderedList(list, printer, multilinePrintChildren);

			strictEqual(
				output.getOutput(),
				" 1. Step 1\n    With details\n 2. Step 2\n    More details\n    Even more\n",
			);
		});

		it("handles multiline list items with header", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const list = bulletList(
				[listItem("First item\nWith continuation"), listItem("Second item\nAlso continued")],
				undefined,
				"My List",
			);

			printBulletList(list, printer, multilinePrintChildren);

			strictEqual(
				output.getOutput(),
				"My List:\n- First item\n  With continuation\n- Second item\n  Also continued\n",
			);
		});

		it("handles ordered list with nested paragraphs with correct indentation", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const nestedPrintChildren = (
				children: MarkupGeneralElementContent[],
				printer: any,
				_context: PrintContext,
			): void => {
				children.forEach((child, index) => {
					if (child.type === "text") {
						printer.print(child.value);
					} else if (child.type === "element" && child.name === "paragraph") {
						if (index > 0) printer.newLine(); // Add spacing between paragraphs
						// Simulate paragraph printing
						child.children.forEach((paragraphChild) => {
							if (paragraphChild.type === "text") {
								printer.print(paragraphChild.value);
							}
						});
						printer.newLine();
					}
				});
			};

			const item = {
				children: [
					{
						type: "element",
						name: "paragraph",
						attributes: {},
						children: [text("First paragraph\nwith multiple lines")],
					},
					{
						type: "element",
						name: "paragraph",
						attributes: {},
						children: [text("Second paragraph")],
					},
				] as MarkupGeneralElementContent[],
			};

			printListItem(item, 0, 1, " 1. ", printer, nestedPrintChildren, 2);

			// Nested paragraphs in ordered list should have +2 indent levels (4 spaces)
			strictEqual(
				output.getOutput(),
				" 1. First paragraph\n    with multiple lines\n\n    Second paragraph\n",
			);
		});

		it("handles bullet list with nested elements with correct indentation", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const nestedPrintChildren = (
				children: MarkupGeneralElementContent[],
				printer: any,
				_context: PrintContext,
			): void => {
				children.forEach((child) => {
					if (child.type === "element" && child.name === "paragraph") {
						// Simulate paragraph printing
						child.children.forEach((paragraphChild) => {
							if (paragraphChild.type === "text") {
								printer.print(paragraphChild.value);
							}
						});
						printer.newLine();
					}
				});
			};

			const item = {
				children: [
					{
						type: "element",
						name: "paragraph",
						attributes: {},
						children: [text("Paragraph content\nspanning lines")],
					},
				] as MarkupGeneralElementContent[],
			};

			printListItem(item, 0, 1, "- ", printer, nestedPrintChildren, 1);

			// Nested elements in bullet list should have +1 indent level (2 spaces)
			strictEqual(output.getOutput(), "- Paragraph content\n  spanning lines\n");
		});

		it("handles ordered list with many items to test alignment", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			// Create a list with 12 items to test multi-digit alignment
			const items = Array.from({ length: 12 }, (_, i) => listItem(`Item ${i + 1}`));
			const list = orderedList(items);

			printOrderedList(list, printer, multilinePrintChildren);

			// All markers should be exactly 4 characters wide
			const expected = [
				" 1. Item 1",
				" 2. Item 2",
				" 3. Item 3",
				" 4. Item 4",
				" 5. Item 5",
				" 6. Item 6",
				" 7. Item 7",
				" 8. Item 8",
				" 9. Item 9",
				"10. Item 10",
				"11. Item 11",
				"12. Item 12",
				"",
			].join("\n");

			strictEqual(output.getOutput(), expected);
		});
	});
});
