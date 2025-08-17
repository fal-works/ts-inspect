import assert from "node:assert";
import { describe, it } from "node:test";
import { createPrinter } from "./printer.ts";

describe("core/printer", () => {
	describe("createPrinter", () => {
		it("prints simple text without newlines", () => {
			const printer = createPrinter();
			printer.print("Hello");
			printer.print("World");

			assert.strictEqual(printer.getOutput(), "HelloWorld");
		});

		it("println adds exactly one newline", () => {
			const printer = createPrinter();
			printer.println("Hello");
			printer.println("World");

			assert.strictEqual(printer.getOutput(), "Hello\nWorld\n");
		});

		it("handles grouping with indentation", () => {
			const printer = createPrinter();
			printer.group("Group 1:");
			printer.println("Item 1");
			printer.println("Item 2");
			printer.groupEnd();
			printer.print("Outside");

			const expected = "Group 1:\n  Item 1\n  Item 2\nOutside";
			assert.strictEqual(printer.getOutput(), expected);
		});

		it("handles nested groups", () => {
			const printer = createPrinter();
			printer.group("Outer:");
			printer.println("Outer item");
			printer.group("Inner:");
			printer.println("Inner item");
			printer.groupEnd();
			printer.println("Back to outer");
			printer.groupEnd();

			const expected = "Outer:\n  Outer item\n  Inner:\n    Inner item\n  Back to outer\n";
			assert.strictEqual(printer.getOutput(), expected);
		});

		it("handles multiline text with proper indentation", () => {
			const printer = createPrinter();
			printer.group("Group:");
			printer.print("Line 1\nLine 2\nLine 3");
			printer.groupEnd();

			const expected = "Group:\n  Line 1\n  Line 2\n  Line 3\n";
			assert.strictEqual(printer.getOutput(), expected);
		});

		it("handles empty groups", () => {
			const printer = createPrinter();
			printer.group("Empty group:");
			printer.groupEnd();
			printer.print("After");

			const expected = "Empty group:\nAfter";
			assert.strictEqual(printer.getOutput(), expected);
		});

		it("prevents negative indentation", () => {
			const printer = createPrinter();
			printer.groupEnd(); // Should not crash or cause negative indent
			printer.print("Normal text");

			assert.strictEqual(printer.getOutput(), "Normal text");
		});

		it("handles group without heading", () => {
			const printer = createPrinter();
			printer.println("Before group");
			printer.group(); // No heading
			printer.println("Indented item");
			printer.groupEnd();
			printer.print("After group");

			const expected = "Before group\n  Indented item\nAfter group";
			assert.strictEqual(printer.getOutput(), expected);
		});

		it("groupEnd only adds newline if not at line start", () => {
			const printer = createPrinter();
			printer.group("Group:");
			printer.print("Content");
			printer.groupEnd(); // Should add newline because we're not at line start
			printer.print("After");

			const expected = "Group:\n  Content\nAfter";
			assert.strictEqual(printer.getOutput(), expected);
		});

		it("groupEnd does not add newline if already at line start", () => {
			const printer = createPrinter();
			printer.group("Group:");
			printer.println("Content"); // Already ends with newline
			printer.groupEnd(); // Should NOT add extra newline
			printer.print("After");

			const expected = "Group:\n  Content\nAfter";
			assert.strictEqual(printer.getOutput(), expected);
		});

		it("handles mixed print and println", () => {
			const printer = createPrinter();
			printer.print("Start");
			printer.print(" middle ");
			printer.println("end");
			printer.println("Next line");

			assert.strictEqual(printer.getOutput(), "Start middle end\nNext line\n");
		});

		it("group with heading adds newline if not at line start", () => {
			const printer = createPrinter();
			printer.print("Some content");
			printer.group("Group heading"); // Should add newline before heading
			printer.println("Group content");
			printer.groupEnd();

			const expected = "Some content\nGroup heading\n  Group content\n";
			assert.strictEqual(printer.getOutput(), expected);
		});

		it("group with heading does not add extra newline if already at line start", () => {
			const printer = createPrinter();
			printer.println("Some content"); // Already ends with newline
			printer.group("Group heading"); // Should not add extra newline
			printer.println("Group content");
			printer.groupEnd();

			const expected = "Some content\nGroup heading\n  Group content\n";
			assert.strictEqual(printer.getOutput(), expected);
		});
	});
});
