import assert from "node:assert";
import { describe, it } from "node:test";
import { mockWritable } from "../../../test/test-utils.ts";
import { createPrinter } from "../../core/printer.ts";
import type {
	ProjectDiagnostic,
	RichFileDiagnostic,
	RichLocationDiagnostic,
	SimpleDiagnostic,
} from "../../diagnostics/index.ts";
import { printRichDiagnostic, printSimpleDiagnostic } from "./diagnostic-printer.ts";

describe("reporter/summary-reporter/diagnostic-printer", () => {
	describe("printSimpleDiagnostic", () => {
		it("prints simple location diagnostic with error severity", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostic: SimpleDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test.ts",
				location: { line: 42, snippet: "value as any" },
			};

			printSimpleDiagnostic(diagnostic, printer);

			assert.strictEqual(output.getOutput(), "❌ src/test.ts:42 - value as any\n");
		});

		it("prints simple location diagnostic with warning severity", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostic: SimpleDiagnostic = {
				type: "location",
				severity: "warning",
				file: "src/test.ts",
				location: { line: 10 },
			};

			printSimpleDiagnostic(diagnostic, printer);

			assert.strictEqual(output.getOutput(), "⚠️  src/test.ts:10\n");
		});

		it("prints simple location diagnostic with info severity", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostic: SimpleDiagnostic = {
				type: "location",
				severity: "info",
				file: "src/test.ts",
				location: { line: 5, snippet: "console.log()" },
			};

			printSimpleDiagnostic(diagnostic, printer);

			assert.strictEqual(output.getOutput(), "ℹ️  src/test.ts:5 - console.log()\n");
		});

		it("prints simple file diagnostic", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostic: SimpleDiagnostic = {
				type: "file",
				severity: "error",
				file: "src/module.ts",
			};

			printSimpleDiagnostic(diagnostic, printer);

			assert.strictEqual(output.getOutput(), "❌ src/module.ts\n");
		});

		it("handles multiline snippets in simple location diagnostics", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostic: SimpleDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test.ts",
				location: {
					line: 15,
					snippet: "{\n    prop: value as any,\n    other: 'test'\n}",
				},
			};

			printSimpleDiagnostic(diagnostic, printer);

			const expected = "\n❌ src/test.ts:15\n{\nprop: value as any,\nother: 'test'\n}\n\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});

	describe("printRichDiagnostic", () => {
		it("prints rich location diagnostic with message and advice", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostic: RichLocationDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test.ts",
				location: { line: 42, snippet: "value as any" },
				details: {
					message: "Avoid type assertions",
					advices: "Use proper typing instead",
				},
			};

			printRichDiagnostic(diagnostic, printer);

			const expected =
				"❌ src/test.ts:42 - value as any\n" +
				"Avoid type assertions\n" +
				"Use proper typing instead\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints rich location diagnostic with message but no advice", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostic: RichLocationDiagnostic = {
				type: "location",
				severity: "warning",
				file: "src/test.ts",
				location: { line: 10 },
				details: { message: "This might be problematic" },
			};

			printRichDiagnostic(diagnostic, printer);

			const expected = "⚠️  src/test.ts:10\nThis might be problematic\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints rich file diagnostic", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostic: RichFileDiagnostic = {
				type: "file",
				severity: "error",
				file: "src/module.ts",
				details: {
					message: "File has structural issues",
					advices: "Consider refactoring the structure in the file",
				},
			};

			printRichDiagnostic(diagnostic, printer);

			const expected =
				"❌ src/module.ts\n" +
				"File has structural issues\n" +
				"Consider refactoring the structure in the file\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints rich project diagnostic", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostic: ProjectDiagnostic = {
				type: "project",
				severity: "warning",
				details: {
					message: "Architecture violation detected",
					advices: "Review the dependency graph",
				},
			};

			printRichDiagnostic(diagnostic, printer);

			const expected =
				"⚠️  (project-level issue)\n" +
				"Architecture violation detected\n" +
				"Review the dependency graph\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("handles rich diagnostic with multiline location snippet", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostic: RichLocationDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/complex.ts",
				location: {
					line: 25,
					snippet: "const result = {\n    data: response as ApiResponse,\n    success: true\n}",
				},
				details: {
					message: "Unsafe type assertion in object literal",
					advices: "Define proper interfaces for API responses",
				},
			};

			printRichDiagnostic(diagnostic, printer);

			const expected =
				"\n❌ src/complex.ts:25\n" +
				"const result = {\n" +
				"data: response as ApiResponse,\n" +
				"success: true\n" +
				"}\n" +
				"\n" +
				"Unsafe type assertion in object literal\n" +
				"Define proper interfaces for API responses\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});

	describe("icon mapping", () => {
		it("uses correct icons for all severity levels", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			const errorDiag: SimpleDiagnostic = {
				type: "file",
				severity: "error",
				file: "error.ts",
			};

			const warningDiag: SimpleDiagnostic = {
				type: "file",
				severity: "warning",
				file: "warning.ts",
			};

			const infoDiag: SimpleDiagnostic = {
				type: "file",
				severity: "info",
				file: "info.ts",
			};

			printSimpleDiagnostic(errorDiag, printer);
			printSimpleDiagnostic(warningDiag, printer);
			printSimpleDiagnostic(infoDiag, printer);

			const expected = "❌ error.ts\n" + "⚠️  warning.ts\n" + "ℹ️  info.ts\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});

	describe("newline behavior verification", () => {
		it("ensures proper separation between consecutive simple diagnostics", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			const diag1: SimpleDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test1.ts",
				location: { line: 1, snippet: "first" },
			};

			const diag2: SimpleDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test2.ts",
				location: { line: 2, snippet: "second" },
			};

			printSimpleDiagnostic(diag1, printer);
			printSimpleDiagnostic(diag2, printer);

			const expected = "❌ src/test1.ts:1 - first\n" + "❌ src/test2.ts:2 - second\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("ensures proper separation between consecutive rich diagnostics", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			const diag1: RichLocationDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test1.ts",
				location: { line: 1, snippet: "first" },
				details: { message: "First issue" },
			};

			const diag2: RichLocationDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/test2.ts",
				location: { line: 2, snippet: "second" },
				details: { message: "Second issue" },
			};

			printRichDiagnostic(diag1, printer);
			printRichDiagnostic(diag2, printer);

			const expected =
				"❌ src/test1.ts:1 - first\n" +
				"First issue\n" +
				"❌ src/test2.ts:2 - second\n" +
				"Second issue\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("ensures proper separation between mixed simple and rich diagnostics", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			const simpleDiag: SimpleDiagnostic = {
				type: "file",
				severity: "warning",
				file: "src/simple.ts",
			};

			const richDiag: RichLocationDiagnostic = {
				type: "location",
				severity: "error",
				file: "src/rich.ts",
				location: { line: 5, snippet: "rich snippet" },
				details: { message: "Rich diagnostic message" },
			};

			printSimpleDiagnostic(simpleDiag, printer);
			printRichDiagnostic(richDiag, printer);

			const expected =
				"⚠️  src/simple.ts\n" + "❌ src/rich.ts:5 - rich snippet\n" + "Rich diagnostic message\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});
});
