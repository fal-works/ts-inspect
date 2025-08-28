import assert from "node:assert";
import { describe, it } from "node:test";
import { mockWritable } from "../../../test/test-utils.ts";
import type { RichDiagnostics, SimpleDiagnostics } from "../../diagnostics/index.ts";
import { createPrinter } from "../../printer/printer.ts";
import { printRichDiagnostics, printSimpleDiagnostics } from "./diagnostics-printer.ts";

describe("builtin-reporters/summary/diagnostics-printer", () => {
	describe("printSimpleDiagnostics", () => {
		it("prints simple diagnostics correctly", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostics: SimpleDiagnostics = {
				type: "simple",
				details: { message: "Issues found" },
				perFile: new Map([
					[
						"test.ts",
						{
							locations: [[{ line: 1, snippet: "code" }, { severity: "error" }]],
						},
					],
					[
						"other.ts",
						{
							locations: [[{ line: 2 }, { severity: "warning" }]],
						},
					],
				]),
			};

			printSimpleDiagnostics(diagnostics, printer);

			const result = output.getOutput();
			assert.ok(result.includes("❌ test.ts:1 - code"));
			assert.ok(result.includes("⚠️  other.ts:2"));
		});

		it("handles empty diagnostics", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostics: SimpleDiagnostics = {
				type: "simple",
				details: { message: "No issues" },
				perFile: new Map(),
			};

			printSimpleDiagnostics(diagnostics, printer);

			assert.strictEqual(output.getOutput(), "");
		});
	});

	describe("printRichDiagnostics", () => {
		it("prints rich diagnostics with proper spacing", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostics: RichDiagnostics = {
				type: "rich",
				project: [{ severity: "error", details: { message: "Project issue" } }],
				perFile: new Map([
					[
						"test.ts",
						{
							wholeFile: [{ severity: "warning", details: { message: "File issue" } }],
							locations: [],
						},
					],
				]),
			};

			printRichDiagnostics(diagnostics, printer);

			const result = output.getOutput();
			assert.ok(result.includes("❌ (project-level issue)"));
			assert.ok(result.includes("Project issue"));
			assert.ok(result.includes("⚠️  test.ts"));
			assert.ok(result.includes("File issue"));
		});

		it("handles empty rich diagnostics", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostics: RichDiagnostics = {
				type: "rich",
				project: [],
				perFile: new Map(),
			};

			printRichDiagnostics(diagnostics, printer);

			assert.strictEqual(output.getOutput(), "");
		});
	});
});
