/**
 * Tests for main markup printer functionality.
 */

import { strictEqual } from "node:assert";
import { describe, it } from "node:test";
import { mockWritable } from "../../../../test/test-utils.ts";
import {
	bulletList,
	code,
	exampleList,
	hint,
	listItem,
	markup,
	orderedList,
	paragraph,
	stepwiseInstructionList,
	strong,
	text,
} from "../../../diagnostics/markup/builders.ts";
import { createPrinter } from "../../../printer/printer.ts";
import { printMarkup } from "./index.ts";

describe("reporter/summary-reporter/markup-printer", () => {
	describe("printMarkup", () => {
		it("prints simple text paragraph", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([paragraph("Hello world")]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "Hello world\n");
		});

		it("ignores strong formatting", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([paragraph([text("Hello "), strong("bold"), text(" world")])]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "Hello bold world\n");
		});

		it("ignores code formatting", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([
				paragraph([text("Use "), code("console.log()"), text(" for debugging")]),
			]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "Use console.log() for debugging\n");
		});

		it("converts bullet lists with proper hyphen character", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([bulletList([listItem("First item"), listItem("Second item")])]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "- First item\n- Second item\n");
		});

		it("converts ordered lists with numbering", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([orderedList([listItem("First item"), listItem("Second item")])]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), " 1. First item\n 2. Second item\n");
		});

		it("handles nested list indentation using printer groups", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([
				bulletList([
					listItem("Top level item"),
					listItem([
						text("Item with nested content"),
						bulletList([listItem("Nested item 1"), listItem("Nested item 2")]),
					]),
				]),
			]);

			printMarkup(markupDoc, printer);

			// Should show proper indentation for nested content
			strictEqual(
				output.getOutput(),
				"- Top level item\n- Item with nested content\n  - Nested item 1\n  - Nested item 2\n",
			);
		});

		it("handles complex nested content", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([
				paragraph([text("Consider the following "), strong("important"), text(" items:")]),
				bulletList([
					listItem([text("Use "), code("const"), text(" instead of "), code("var")]),
					listItem("Always handle errors"),
				]),
			]);

			printMarkup(markupDoc, printer);

			// HTML-like spacing: empty line between paragraph and bullet list in normal context
			strictEqual(
				output.getOutput(),
				"Consider the following important items:\n\n- Use const instead of var\n- Always handle errors\n",
			);
		});

		it("prints paragraph with custom caption", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([
				paragraph("This is important information", undefined, "Custom Header"),
			]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "Custom Header:\nThis is important information\n");
		});

		it("prints paragraph with intention (converts to Title Case)", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([hint("This is a helpful hint")]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "Hint:\nThis is a helpful hint\n");
		});

		it("prints bullet list with custom caption", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([
				bulletList([listItem("First item"), listItem("Second item")], undefined, "My List"),
			]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "My List:\n- First item\n- Second item\n");
		});

		it("prints bullet list with intention (examples)", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([exampleList(["Example one", "Example two"])]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "Examples:\n- Example one\n- Example two\n");
		});

		it("prints ordered list with intention (stepwise-instructions)", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([stepwiseInstructionList(["First step", "Second step"])]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "Stepwise Instructions:\n 1. First step\n 2. Second step\n");
		});

		it("prefers caption over intention when both are present", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([
				bulletList([listItem("Item")], "examples", "Custom Examples Header"),
			]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "Custom Examples Header:\n- Item\n");
		});

		it("falls back to intention when caption is empty string", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([paragraph("Content with empty caption", "hint", "")]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "Hint:\nContent with empty caption\n");
		});

		it("handles empty caption with bullet list", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([
				bulletList([listItem("Item one"), listItem("Item two")], "examples", ""),
			]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "Examples:\n- Item one\n- Item two\n");
		});

		it("handles empty caption with ordered list", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([
				orderedList([listItem("Step one"), listItem("Step two")], "stepwise-instructions", ""),
			]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "Stepwise Instructions:\n 1. Step one\n 2. Step two\n");
		});

		it("behaves normally when both caption and intention are empty/undefined", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([paragraph("Normal paragraph content", undefined, "")]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "Normal paragraph content\n");
		});

		it("HTML-like spacing: multiple paragraphs in normal context", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([
				paragraph("First paragraph"),
				paragraph("Second paragraph"),
				paragraph("Third paragraph"),
			]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "First paragraph\n\nSecond paragraph\n\nThird paragraph\n");
		});

		it("HTML-like spacing: multiple paragraphs inside list item", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([
				bulletList([
					listItem([paragraph("First paragraph in item"), paragraph("Second paragraph in item")]),
				]),
			]);

			printMarkup(markupDoc, printer);

			strictEqual(output.getOutput(), "- First paragraph in item\n  Second paragraph in item\n");
		});

		it("HTML-like spacing: mixed content in list item with final paragraph", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const markupDoc = markup([
				bulletList([
					listItem([
						text("Some text"),
						bulletList([listItem("Nested item")]),
						paragraph("Final paragraph"),
					]),
				]),
			]);

			printMarkup(markupDoc, printer);

			// Text, then newline before nested list, then final paragraph - no empty lines inside list items
			strictEqual(output.getOutput(), "- Some text\n  - Nested item\n  Final paragraph\n");
		});
	});
});
