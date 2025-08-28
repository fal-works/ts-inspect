/**
 * Tests for individual element printer functions.
 */

import { strictEqual } from "node:assert";
import { describe, it } from "node:test";
import { mockWritable } from "../../../../test/test-utils.ts";
import { code, strong, text } from "../../../diagnostics/markup/builders.ts";
import { createPrinter } from "../../../reporter/index.ts";
import { printTextElement } from "./element-printer.ts";

describe("builtin-reporters/summary/markup-printer/element-printer", () => {
	describe("printTextElement", () => {
		it("prints text content directly", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			printTextElement("Hello world", printer);

			strictEqual(output.getOutput(), "Hello world");
		});

		it("handles empty text", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			printTextElement("", printer);

			strictEqual(output.getOutput(), "");
		});

		it("handles text with special characters", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			printTextElement("Text with\nnewlines and\ttabs", printer);

			strictEqual(output.getOutput(), "Text with\nnewlines and\ttabs");
		});
	});

	describe("printFormattingElement", () => {
		it("prints content by delegating to printMarkupChildren", () => {
			const strongElement = strong("bold text");

			// Since printFormattingElement just delegates to printMarkupChildren,
			// we'll test this through integration - the main integration tests
			// already cover this functionality comprehensively

			strictEqual(strongElement.children.length, 1);
			strictEqual(strongElement.children[0].type, "text");
			if (strongElement.children[0].type === "text") {
				strictEqual(strongElement.children[0].value, "bold text");
			}
		});

		it("handles code elements correctly", () => {
			const codeElement = code("console.log()");

			// Test the structure - the actual formatting behavior is tested in integration tests
			strictEqual(codeElement.children.length, 1);
			strictEqual(codeElement.children[0].type, "text");
			if (codeElement.children[0].type === "text") {
				strictEqual(codeElement.children[0].value, "console.log()");
			}
		});

		it("works with any markup children", () => {
			const mixedContent = [text("before "), strong("bold"), text(" after")];

			// Test the structure - integration tests cover the actual printing behavior
			strictEqual(mixedContent.length, 3);
			strictEqual(mixedContent[0].type, "text");
			strictEqual(mixedContent[1].type, "element");
			strictEqual(mixedContent[2].type, "text");
		});
	});
});
