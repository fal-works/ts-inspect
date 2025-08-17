import assert from "node:assert";
import { Writable } from "node:stream";
import { describe, it } from "node:test";
import { createPrinter } from "../../core/printer.ts";
import type {
	LocationDiagnostic,
	ModuleDiagnostic,
	ProjectDiagnostic,
} from "../../diagnostics/index.ts";
import {
	printLocationDiagnostic,
	printModuleDiagnostic,
	printProjectDiagnostic,
} from "./diagnostic-type-printer.ts";

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

describe("reporter/summary-reporter/diagnostic-type-printer", () => {
	describe("printLocationDiagnostic", () => {
		it("prints location diagnostic without snippet", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			const diagnostic: LocationDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test.ts",
				location: { line: 42 },
			};

			printLocationDiagnostic(diagnostic, "❌", printer);

			assert.strictEqual(output.getOutput(), "❌ src/test.ts:42\n");
		});

		it("prints location diagnostic with single-line snippet", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			const diagnostic: LocationDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test.ts",
				location: { line: 42, snippet: "value as any" },
			};

			printLocationDiagnostic(diagnostic, "❌", printer);

			assert.strictEqual(output.getOutput(), "❌ src/test.ts:42 - value as any\n");
		});

		it("prints location diagnostic with multiline snippet", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			const diagnostic: LocationDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test.ts",
				location: {
					line: 42,
					snippet: "{\n    file: 'test.ts',\n    value: 123\n}",
				},
			};

			printLocationDiagnostic(diagnostic, "❌", printer);

			const expected = "\n❌ src/test.ts:42\n{\nfile: 'test.ts',\nvalue: 123\n}\n\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("handles tabs in multiline snippets correctly", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			const diagnostic: LocationDiagnostic = {
				type: "location",
				severity: "warning",
				file: "src/test.ts",
				location: {
					line: 10,
					snippet: "{\n\tname: 'test',\n\t\tvalue: 42\n}",
				},
			};

			printLocationDiagnostic(diagnostic, "⚠️", printer);

			const expected = "\n⚠️ src/test.ts:10\n{\nname: 'test',\n    value: 42\n}\n\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("handles empty snippet", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			const diagnostic: LocationDiagnostic = {
				type: "location",
				severity: "info",
				file: "src/test.ts",
				location: { line: 5, snippet: "" },
			};

			printLocationDiagnostic(diagnostic, "ℹ️", printer);

			assert.strictEqual(output.getOutput(), "ℹ️ src/test.ts:5\n");
		});

		it("uses newLine(1) for multiline snippets to prevent excessive spacing", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);

			// First print something to ensure we're not at line start
			printer.print("Previous content");

			const diagnostic: LocationDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test.ts",
				location: {
					line: 42,
					snippet: "line1\nline2",
				},
			};

			printLocationDiagnostic(diagnostic, "❌", printer);

			const expected = "Previous content\n❌ src/test.ts:42\nline1\nline2\n\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});

	describe("printModuleDiagnostic", () => {
		it("prints module diagnostic with icon and file path", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			const diagnostic: ModuleDiagnostic = {
				type: "module",
				severity: "warning",
				file: "src/module.ts",
			};

			printModuleDiagnostic(diagnostic, "⚠️", printer);

			assert.strictEqual(output.getOutput(), "⚠️ src/module.ts\n");
		});

		it("handles different icons correctly", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			const diagnostic: ModuleDiagnostic = {
				type: "module",
				severity: "error",
				file: "src/error.ts",
			};

			printModuleDiagnostic(diagnostic, "❌", printer);

			assert.strictEqual(output.getOutput(), "❌ src/error.ts\n");
		});

		it("handles long file paths", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			const diagnostic: ModuleDiagnostic = {
				type: "module",
				severity: "info",
				file: "src/very/deep/nested/directory/structure/file.ts",
			};

			printModuleDiagnostic(diagnostic, "ℹ️", printer);

			assert.strictEqual(
				output.getOutput(),
				"ℹ️ src/very/deep/nested/directory/structure/file.ts\n",
			);
		});
	});

	describe("printProjectDiagnostic", () => {
		it("prints project diagnostic with generic message", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			const diagnostic: ProjectDiagnostic = {
				type: "project",
				severity: "error",
				message: "Architecture violation detected",
			};

			printProjectDiagnostic(diagnostic, "❌", printer);

			assert.strictEqual(output.getOutput(), "❌ (project-level issue)\n");
		});

		it("ignores diagnostic content and only shows generic project message", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			const diagnostic: ProjectDiagnostic = {
				type: "project",
				severity: "warning",
				message: "Some complex project issue with lots of details",
				advices: "Here's how to fix it...",
			};

			printProjectDiagnostic(diagnostic, "⚠️", printer);

			assert.strictEqual(output.getOutput(), "⚠️ (project-level issue)\n");
		});

		it("handles different severity icons", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);
			const diagnostic: ProjectDiagnostic = {
				type: "project",
				severity: "info",
				message: "Info message",
			};

			printProjectDiagnostic(diagnostic, "ℹ️", printer);

			assert.strictEqual(output.getOutput(), "ℹ️ (project-level issue)\n");
		});
	});

	describe("newline behavior", () => {
		it("ensures each diagnostic call results in proper newline separation", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);

			const locationDiag: LocationDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test.ts",
				location: { line: 1, snippet: "simple" },
			};

			const moduleDiag: ModuleDiagnostic = {
				type: "module",
				severity: "warning",
				file: "src/module.ts",
			};

			const projectDiag: ProjectDiagnostic = {
				type: "project",
				severity: "info",
				message: "Project issue",
			};

			printLocationDiagnostic(locationDiag, "❌", printer);
			printModuleDiagnostic(moduleDiag, "⚠️", printer);
			printProjectDiagnostic(projectDiag, "ℹ️", printer);

			const expected =
				"❌ src/test.ts:1 - simple\n" + "⚠️ src/module.ts\n" + "ℹ️ (project-level issue)\n";

			assert.strictEqual(output.getOutput(), expected);
		});

		it("multiline location diagnostics have proper spacing", () => {
			const output = new MockWritable();
			const printer = createPrinter(output);

			const diagnostic1: LocationDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test1.ts",
				location: { line: 1, snippet: "line1\nline2" },
			};

			const diagnostic2: LocationDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test2.ts",
				location: { line: 5, snippet: "simple" },
			};

			printLocationDiagnostic(diagnostic1, "❌", printer);
			printLocationDiagnostic(diagnostic2, "❌", printer);

			const expected = "\n❌ src/test1.ts:1\nline1\nline2\n\n" + "❌ src/test2.ts:5 - simple\n";

			assert.strictEqual(output.getOutput(), expected);
		});
	});
});
