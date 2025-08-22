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
		it("returns Printer with all required methods", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);

			// Check that it has all Printer methods
			assert.strictEqual(typeof printer.print, "function");
			assert.strictEqual(typeof printer.println, "function");
			assert.strictEqual(typeof printer.newLine, "function");
			assert.strictEqual(typeof printer.group, "function");
			assert.strictEqual(typeof printer.groupEnd, "function");
		});
	});

	describe("type Printer", () => {
		function captureOutput(fn: (printer: ReturnType<typeof createPrinter>) => void): string {
			const output = new MockWritable();
			const printer = createPrinter(output);
			fn(printer);
			return output.getOutput();
		}
		describe("print", () => {
			it("prints simple text without newlines", () => {
				const output = captureOutput((printer) => {
					printer.print("Hello");
					printer.print("World");
				});
				assert.strictEqual(output, "HelloWorld");
			});

			it("handles multiline text with proper indentation", () => {
				const output = captureOutput((printer) => {
					printer.group("Group:");
					printer.print("Line 1\nLine 2\nLine 3");
					printer.groupEnd();
				});
				assert.strictEqual(output, "Group:\n  Line 1\n  Line 2\n  Line 3\n");
			});

			it("handles mixed print and println", () => {
				const output = captureOutput((printer) => {
					printer.print("Start");
					printer.print(" middle ");
					printer.println("end");
					printer.println("Next line");
				});
				assert.strictEqual(output, "Start middle end\nNext line\n");
			});
		});

		describe("println", () => {
			it("adds exactly one newline", () => {
				const output = captureOutput((printer) => {
					printer.println("Hello");
					printer.println("World");
				});
				assert.strictEqual(output, "Hello\nWorld\n");
			});
		});

		describe("group", () => {
			it("handles grouping with indentation", () => {
				const output = captureOutput((printer) => {
					printer.group("Group 1:");
					printer.println("Item 1");
					printer.println("Item 2");
					printer.groupEnd();
					printer.print("Outside");
				});
				assert.strictEqual(output, "Group 1:\n  Item 1\n  Item 2\nOutside");
			});

			it("handles nested groups", () => {
				const output = captureOutput((printer) => {
					printer.group("Outer:");
					printer.println("Outer item");
					printer.group("Inner:");
					printer.println("Inner item");
					printer.groupEnd();
					printer.println("Back to outer");
					printer.groupEnd();
				});
				assert.strictEqual(
					output,
					"Outer:\n  Outer item\n  Inner:\n    Inner item\n  Back to outer\n",
				);
			});

			it("handles group without heading", () => {
				const output = captureOutput((printer) => {
					printer.println("Before group");
					printer.group(); // No heading
					printer.println("Indented item");
					printer.groupEnd();
					printer.print("After group");
				});
				assert.strictEqual(output, "Before group\n  Indented item\nAfter group");
			});

			it("handles empty groups", () => {
				const output = captureOutput((printer) => {
					printer.group("Empty group:");
					printer.groupEnd();
					printer.print("After");
				});
				assert.strictEqual(output, "Empty group:\nAfter");
			});

			it("adds newline before heading if not at line start", () => {
				const output = captureOutput((printer) => {
					printer.print("Some content");
					printer.group("Group heading"); // Should add newline before heading
					printer.println("Group content");
					printer.groupEnd();
				});
				assert.strictEqual(output, "Some content\nGroup heading\n  Group content\n");
			});

			it("does not add extra newline if already at line start", () => {
				const output = captureOutput((printer) => {
					printer.println("Some content"); // Already ends with newline
					printer.group("Group heading"); // Should not add extra newline
					printer.println("Group content");
					printer.groupEnd();
				});
				assert.strictEqual(output, "Some content\nGroup heading\n  Group content\n");
			});
		});

		describe("groupEnd", () => {
			it("prevents negative indentation", () => {
				const output = captureOutput((printer) => {
					printer.groupEnd(); // Should not crash or cause negative indent
					printer.print("Normal text");
				});
				assert.strictEqual(output, "Normal text");
			});

			it("adds newline if not at line start", () => {
				const output = captureOutput((printer) => {
					printer.group("Group:");
					printer.print("Content");
					printer.groupEnd(); // Should add newline because we're not at line start
					printer.print("After");
				});
				assert.strictEqual(output, "Group:\n  Content\nAfter");
			});

			it("does not add newline if already at line start", () => {
				const output = captureOutput((printer) => {
					printer.group("Group:");
					printer.println("Content"); // Already ends with newline
					printer.groupEnd(); // Should NOT add extra newline
					printer.print("After");
				});
				assert.strictEqual(output, "Group:\n  Content\nAfter");
			});
		});

		describe("newLine", () => {
			it("adds exactly one newline", () => {
				const output = captureOutput((printer) => {
					printer.print("First line");
					printer.newLine();
					printer.print("Second line");
				});
				assert.strictEqual(output, "First line\nSecond line");
			});

			it("multiple calls add multiple newlines", () => {
				const output = captureOutput((printer) => {
					printer.print("Text");
					printer.newLine();
					printer.newLine();
					printer.print("After two newlines");
				});
				assert.strictEqual(output, "Text\n\nAfter two newlines");
			});

			it("works with indentation", () => {
				const output = captureOutput((printer) => {
					printer.group("Group:");
					printer.print("Content");
					printer.newLine();
					printer.print("More content");
					printer.groupEnd();
				});
				assert.strictEqual(output, "Group:\n  Content\n  More content\n");
			});

			it("with maxEmptyLines prevents excessive empty lines", () => {
				const output = captureOutput((printer) => {
					printer.print("Content");
					printer.newLine(2); // Ends current line (1st linefeed)
					printer.newLine(2); // Creates 1st empty line (2nd linefeed)
					printer.newLine(2); // Creates 2nd empty line (3rd linefeed)
					printer.newLine(2); // Should be blocked - would create 3rd empty line
					printer.newLine(2); // Should be blocked - would create 3rd empty line
					printer.print("After");
				});
				assert.strictEqual(output, "Content\n\n\nAfter");
			});

			it("without maxEmptyLines always adds newlines", () => {
				const output = captureOutput((printer) => {
					printer.print("Content");
					printer.newLine(); // No limit
					printer.newLine(); // No limit
					printer.newLine(); // No limit
					printer.print("After");
				});
				assert.strictEqual(output, "Content\n\n\nAfter");
			});

			it("resets count when content is written", () => {
				const output = captureOutput((printer) => {
					printer.print("First");
					printer.newLine(1); // Ends current line (1st linefeed)
					printer.newLine(1); // Creates 1st empty line (2nd linefeed)
					printer.newLine(1); // Should be blocked - would create 2nd empty line
					printer.print("Content"); // Resets counter
					printer.newLine(1); // Ends current line (1st linefeed after reset)
					printer.newLine(1); // Creates 1st empty line (2nd linefeed after reset)
					printer.newLine(1); // Should be blocked - would create 2nd empty line
					printer.print("Last");
				});
				assert.strictEqual(output, "First\n\nContent\n\nLast");
			});

			it("with maxEmptyLines=0 prevents empty lines", () => {
				const output = captureOutput((printer) => {
					printer.print("Content");
					printer.newLine(0); // Should add newline since not at line start (ending current line)
					printer.print("After");
					printer.newLine(0); // Should add newline since not at line start (ending current line)
					printer.newLine(0); // Should be ignored since already at line start (would create empty line)
					printer.newLine(0); // Should be ignored since already at line start (would create empty line)
					printer.print("Final");
				});
				assert.strictEqual(output, "Content\nAfter\nFinal");
			});

			it("with maxEmptyLines=0 blocks exactly after one linefeed", () => {
				const output = captureOutput((printer) => {
					printer.print("Content");
					printer.newLine(0); // Ends current line (1st linefeed, allowed)
					printer.print("After"); // Resets counter
					printer.newLine(0); // Ends current line (1st linefeed after reset, allowed)
					printer.newLine(0); // Should be blocked - would create empty line
					printer.newLine(0); // Should be blocked - would create empty line
					printer.print("Final");
				});
				assert.strictEqual(output, "Content\nAfter\nFinal");
			});
		});
	});
});
