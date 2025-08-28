/**
 * Tests for paragraph printer functions.
 */

import { strictEqual } from "node:assert";
import { describe, it } from "node:test";
import { mockWritable } from "../../../../test/test-utils.ts";
import { paragraph, text } from "../../../diagnostics/markup/builders.ts";
import type { MarkupGeneralElementContent } from "../../../diagnostics/markup/types.ts";
import { createPrinter } from "../../../reporter/index.ts";
import { printParagraph, printParagraphContent } from "./paragraph-printer.ts";
import type { PrintContext } from "./spacing.ts";

describe("builtin-reporters/summary/markup-printer/paragraph-printer", () => {
	const mockPrintChildren = (
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

	describe("printParagraphContent", () => {
		it("prints paragraph with header at same indentation level", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const children = [text("This is content")];
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: true,
			};

			printParagraphContent(children, printer, context, mockPrintChildren, "Header");

			strictEqual(output.getOutput(), "Header:\nThis is content\n");
		});

		it("prints paragraph content without header when no header provided", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const children = [text("Simple paragraph")];
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: true,
			};

			printParagraphContent(children, printer, context, mockPrintChildren);

			strictEqual(output.getOutput(), "Simple paragraph\n");
		});
	});

	describe("printParagraph", () => {
		it("prints paragraph without header when no caption or intention", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const para = paragraph("Simple paragraph");
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: true,
			};

			printParagraph(para, printer, context, mockPrintChildren);

			strictEqual(output.getOutput(), "Simple paragraph\n");
		});

		it("prints paragraph with caption as header", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const para = paragraph("Content here", undefined, "Custom Caption");
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: true,
			};

			printParagraph(para, printer, context, mockPrintChildren);

			strictEqual(output.getOutput(), "Custom Caption:\nContent here\n");
		});

		it("prints paragraph with intention as header", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const para = paragraph("Helpful information", "hint");
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: true,
			};

			printParagraph(para, printer, context, mockPrintChildren);

			strictEqual(output.getOutput(), "Hint:\nHelpful information\n");
		});

		it("prefers caption over intention", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const para = paragraph("Content", "hint", "Custom Header");
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: true,
			};

			printParagraph(para, printer, context, mockPrintChildren);

			strictEqual(output.getOutput(), "Custom Header:\nContent\n");
		});
	});
});
