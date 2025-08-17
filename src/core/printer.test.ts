import assert from "node:assert";
import { describe, it } from "node:test";
import { createPrinter } from "./printer.ts";

describe("core/printer", () => {
	describe("createPrinter", () => {
		it("prints simple text", () => {
			const printer = createPrinter();
			printer.print("Hello");
			printer.print("World");

			assert.strictEqual(printer.getOutput(), "Hello\nWorld");
		});

		it("prints with newlines", () => {
			const printer = createPrinter();
			printer.println("Hello");
			printer.println("World");

			assert.strictEqual(printer.getOutput(), "Hello\n\nWorld\n");
		});

		it("handles grouping with indentation", () => {
			const printer = createPrinter();
			printer.group("Group 1:");
			printer.print("Item 1");
			printer.print("Item 2");
			printer.groupEnd();
			printer.print("Outside");

			const expected = "Group 1:\n  Item 1\n  Item 2\n\nOutside";
			assert.strictEqual(printer.getOutput(), expected);
		});

		it("handles nested groups", () => {
			const printer = createPrinter();
			printer.group("Outer:");
			printer.print("Outer item");
			printer.group("Inner:");
			printer.print("Inner item");
			printer.groupEnd();
			printer.print("Back to outer");
			printer.groupEnd();

			const expected = "Outer:\n  Outer item\n  Inner:\n    Inner item\n\n  Back to outer\n";
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

			const expected = "Empty group:\n\nAfter";
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
			printer.print("Before group");
			printer.group(); // No heading
			printer.print("Indented item");
			printer.groupEnd();
			printer.print("After group");

			const expected = "Before group\n  Indented item\n\nAfter group";
			assert.strictEqual(printer.getOutput(), expected);
		});
	});
});
