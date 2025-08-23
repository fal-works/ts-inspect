import assert from "node:assert";
import { describe, it } from "node:test";
import { mockWritable } from "../../../test/test-utils.ts";
import { createPrinter } from "../../core/printer.ts";
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
		it("prints rich location finding with message and advice", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const finding = {
				severity: "error" as const,
				message: "Type assertion found",
				advices: "Consider proper typing",
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

		it("prints rich location finding without advice", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const finding = {
				severity: "warning" as const,
				message: "Potential issue detected",
			};

			printRichLocationFinding("src/test.ts", { line: 10 }, finding, printer);

			const outputStr = output.getOutput();
			assert.ok(outputStr.includes("⚠️  src/test.ts:10"));
			assert.ok(outputStr.includes("Potential issue detected"));
			assert.ok(!outputStr.includes("💡"));
		});
	});

	describe("printFileFinding", () => {
		it("prints file-level finding with message and advice", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const finding = {
				severity: "error" as const,
				message: "File has issues",
				advices: "Fix the file structure",
			};

			printFileFinding("src/test.ts", finding, printer);

			const expected = "❌ src/test.ts\nFile has issues\n💡 Fix the file structure\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints file-level finding without advice", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const finding = {
				severity: "warning" as const,
				message: "File warning",
			};

			printFileFinding("src/test.ts", finding, printer);

			const expected = "⚠️  src/test.ts\nFile warning\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});

	describe("printProjectFinding", () => {
		it("prints project-level finding with message and advice", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const finding = {
				severity: "error" as const,
				message: "Project configuration issue",
				advices: "Update your configuration",
			};

			printProjectFinding(finding, printer);

			const expected =
				"❌ (project-level issue)\nProject configuration issue\n💡 Update your configuration\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints project-level finding without advice", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const finding = {
				severity: "info" as const,
				message: "Project info",
			};

			printProjectFinding(finding, printer);

			const expected = "ℹ️  (project-level issue)\nProject info\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});
});
