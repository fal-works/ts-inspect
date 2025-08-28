import assert from "node:assert";
import { describe, it } from "node:test";
import { mockWritable } from "../../../test/test-utils.ts";
import type { DetailedFinding } from "../../diagnostics/finding-types.ts";
import { createPrinter } from "../../printer/printer.ts";
import {
	printFileFinding,
	printLocationFinding,
	printProjectFinding,
	printRichLocationFinding,
} from "./finding-printer.ts";

describe("reporter/summary-reporter/finding-printer", () => {
	describe("printLocationFinding", () => {
		it("prints location finding without snippet", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			printLocationFinding("src/test.ts", { line: 42 }, "error", printer);

			assert.strictEqual(output.getOutput(), "❌ src/test.ts:42\n");
		});

		it("prints location finding with single-line snippet", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			printLocationFinding("src/test.ts", { line: 42, snippet: "value as any" }, "error", printer);

			assert.strictEqual(output.getOutput(), "❌ src/test.ts:42 - value as any\n");
		});

		it("prints location finding with multiline snippet", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			printLocationFinding(
				"src/test.ts",
				{ line: 15, snippet: "const x = {\n  value: 'test'\n}" },
				"warning",
				printer,
			);

			const expected = "\n⚠️  src/test.ts:15\nconst x = {\nvalue: 'test'\n}\n\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints with correct icons for different severities", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			printLocationFinding("file.ts", { line: 1 }, "info", printer);
			printLocationFinding("file.ts", { line: 2 }, "warning", printer);
			printLocationFinding("file.ts", { line: 3 }, "error", printer);

			const expected = "ℹ️  file.ts:1\n⚠️  file.ts:2\n❌ file.ts:3\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});

	describe("printRichLocationFinding", () => {
		it("prints rich location finding with message and instructions", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const finding: DetailedFinding = {
				severity: "error",
				details: {
					message: "Type assertion found",
					instructions: "Consider proper typing",
				},
			};

			printRichLocationFinding(
				"src/test.ts",
				{ line: 42, snippet: "value as any" },
				finding,
				printer,
			);

			const outputStr = output.getOutput();
			assert.ok(outputStr.includes("❌ src/test.ts:42 - value as any"));
			assert.ok(outputStr.includes("Type assertion found"));
			assert.ok(outputStr.includes("Consider proper typing"));
		});

		it("prints rich location finding without instructions", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const finding: DetailedFinding = {
				severity: "warning",
				details: {
					message: "Potential issue detected",
				},
			};

			printRichLocationFinding("src/test.ts", { line: 10 }, finding, printer);

			const outputStr = output.getOutput();
			assert.ok(outputStr.includes("⚠️  src/test.ts:10"));
			assert.ok(outputStr.includes("Potential issue detected"));
		});
	});

	describe("printFileFinding", () => {
		it("prints file-level finding with message and instructions", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const finding: DetailedFinding = {
				severity: "error",
				details: {
					message: "File has issues",
					instructions: "Fix the file structure",
				},
			};

			printFileFinding("src/test.ts", finding, printer);

			const expected = "❌ src/test.ts\nFile has issues\nFix the file structure\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints file-level finding without instructions", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const finding: DetailedFinding = {
				severity: "warning",
				details: {
					message: "File warning",
				},
			};

			printFileFinding("src/test.ts", finding, printer);

			const expected = "⚠️  src/test.ts\nFile warning\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});

	describe("printProjectFinding", () => {
		it("prints project-level finding with message and instructions", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const finding: DetailedFinding = {
				severity: "error",
				details: {
					message: "Project configuration issue",
					instructions: "Update your configuration",
				},
			};

			printProjectFinding(finding, printer);

			const expected =
				"❌ (project-level issue)\nProject configuration issue\nUpdate your configuration\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints project-level finding without instructions", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const finding: DetailedFinding = {
				severity: "info",
				details: {
					message: "Project info",
				},
			};

			printProjectFinding(finding, printer);

			const expected = "ℹ️  (project-level issue)\nProject info\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});
});
