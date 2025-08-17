import assert from "node:assert";
import { Writable } from "node:stream";
import { describe, it } from "node:test";
import { createPrinter } from "./printer.ts";

/**
 * Mock writable stream that collects written data as a string.
 */
class MockWritable extends Writable {
	private chunks: string[] = [];

	_write(
		chunk: Buffer | string,
		_encoding: BufferEncoding,
		callback: (error?: Error | null) => void,
	): void {
		this.chunks.push(chunk.toString());
		callback();
	}

	getOutput(): string {
		return this.chunks.join("");
	}
}

describe("core/printer", () => {
	describe("createPrinter", () => {
		it("prints simple text without newlines", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.print("Hello");
			printer.print("World");

			assert.strictEqual(output.getOutput(), "HelloWorld");
		});

		it("println adds exactly one newline", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.println("Hello");
			printer.println("World");

			assert.strictEqual(output.getOutput(), "Hello\nWorld\n");
		});

		it("handles grouping with indentation", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.group("Group 1:");
			printer.println("Item 1");
			printer.println("Item 2");
			printer.groupEnd();
			printer.print("Outside");

			const expected = "Group 1:\n  Item 1\n  Item 2\nOutside";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("handles nested groups", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.group("Outer:");
			printer.println("Outer item");
			printer.group("Inner:");
			printer.println("Inner item");
			printer.groupEnd();
			printer.println("Back to outer");
			printer.groupEnd();

			const expected = "Outer:\n  Outer item\n  Inner:\n    Inner item\n  Back to outer\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("handles multiline text with proper indentation", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.group("Group:");
			printer.print("Line 1\nLine 2\nLine 3");
			printer.groupEnd();

			const expected = "Group:\n  Line 1\n  Line 2\n  Line 3\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("handles empty groups", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.group("Empty group:");
			printer.groupEnd();
			printer.print("After");

			const expected = "Empty group:\nAfter";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prevents negative indentation", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.groupEnd(); // Should not crash or cause negative indent
			printer.print("Normal text");

			assert.strictEqual(output.getOutput(), "Normal text");
		});

		it("handles group without heading", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.println("Before group");
			printer.group(); // No heading
			printer.println("Indented item");
			printer.groupEnd();
			printer.print("After group");

			const expected = "Before group\n  Indented item\nAfter group";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("groupEnd only adds newline if not at line start", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.group("Group:");
			printer.print("Content");
			printer.groupEnd(); // Should add newline because we're not at line start
			printer.print("After");

			const expected = "Group:\n  Content\nAfter";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("groupEnd does not add newline if already at line start", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.group("Group:");
			printer.println("Content"); // Already ends with newline
			printer.groupEnd(); // Should NOT add extra newline
			printer.print("After");

			const expected = "Group:\n  Content\nAfter";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("handles mixed print and println", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.print("Start");
			printer.print(" middle ");
			printer.println("end");
			printer.println("Next line");

			assert.strictEqual(output.getOutput(), "Start middle end\nNext line\n");
		});

		it("group with heading adds newline if not at line start", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.print("Some content");
			printer.group("Group heading"); // Should add newline before heading
			printer.println("Group content");
			printer.groupEnd();

			const expected = "Some content\nGroup heading\n  Group content\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("group with heading does not add extra newline if already at line start", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.println("Some content"); // Already ends with newline
			printer.group("Group heading"); // Should not add extra newline
			printer.println("Group content");
			printer.groupEnd();

			const expected = "Some content\nGroup heading\n  Group content\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("newLine() adds exactly one newline", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.print("First line");
			printer.newLine();
			printer.print("Second line");

			assert.strictEqual(output.getOutput(), "First line\nSecond line");
		});

		it("multiple newLine() calls add multiple newlines", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.print("Text");
			printer.newLine();
			printer.newLine();
			printer.print("After two newlines");

			assert.strictEqual(output.getOutput(), "Text\n\nAfter two newlines");
		});

		it("newLine() with indentation", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			printer.group("Group:");
			printer.print("Content");
			printer.newLine();
			printer.print("More content");
			printer.groupEnd();

			const expected = "Group:\n  Content\n  More content\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});
});
