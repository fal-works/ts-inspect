import assert from "node:assert";
import { describe, it } from "node:test";
import { mockWritable } from "../../../test/test-utils.ts";
import { createPrinter } from "../../core/printer.ts";
import type { RichDiagnostics } from "../../diagnostics/index.ts";
import { collectRichDiagnosticItems, printRichDiagnosticItems } from "./diagnostic-items.ts";

describe("reporter/summary-reporter/diagnostic-items", () => {
	describe("collectRichDiagnosticItems", () => {
		it("collects items from empty rich diagnostics", () => {
			const diagnostics: RichDiagnostics = {
				type: "rich",
				project: [],
				perFile: new Map(),
			};

			const items = collectRichDiagnosticItems(diagnostics);
			assert.strictEqual(items.length, 0);
		});

		it("collects all rich diagnostic items in order", () => {
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
					[
						"other.ts",
						{
							wholeFile: [],
							locations: [
								[{ line: 1 }, { severity: "info", details: { message: "Location issue" } }],
							],
						},
					],
				]),
			};

			const items = collectRichDiagnosticItems(diagnostics);
			assert.strictEqual(items.length, 3);

			assert.strictEqual(items[0].type, "project");
			assert.strictEqual(items[0].finding.details.message, "Project issue");

			assert.strictEqual(items[1].type, "file");
			assert.strictEqual(items[1].type === "file" ? items[1].file : "", "test.ts");
			assert.strictEqual(items[1].finding.details.message, "File issue");

			assert.strictEqual(items[2].type, "location");
			assert.strictEqual(items[2].type === "location" ? items[2].file : "", "other.ts");
			assert.strictEqual(items[2].finding.details.message, "Location issue");
		});
	});

	describe("printRichDiagnosticItems", () => {
		it("prints rich items with proper spacing", () => {
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

			const items = collectRichDiagnosticItems(diagnostics);
			printRichDiagnosticItems(items, printer);

			const result = output.getOutput();
			assert.ok(result.includes("❌ (project-level issue)"));
			assert.ok(result.includes("Project issue"));
			assert.ok(result.includes("⚠️  test.ts"));
			assert.ok(result.includes("File issue"));

			// Should have spacing between items but not after the last one
			// Project finding prints: icon + newline + message + newline
			// Then spacing newline
			// File finding prints: icon + newline + message + newline + instructions + newline
			const lines = result.split("\n");
			const emptyLineCount = lines.filter((line) => line === "").length;
			// Project item: 0 empty lines, File item: 0 empty lines, 1 spacing line = 1 total
			// But file finding with instructions adds extra newline, so we expect 1 spacing line
			assert.ok(
				emptyLineCount >= 1,
				`Expected at least 1 empty line, got ${emptyLineCount}. Full output:\n${JSON.stringify(result)}`,
			);
		});

		it("prints single item without trailing newline", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const diagnostics: RichDiagnostics = {
				type: "rich",
				project: [],
				perFile: new Map([
					[
						"test.ts",
						{
							wholeFile: [],
							locations: [
								[
									{ line: 1, snippet: "code" },
									{ severity: "error", details: { message: "Location issue" } },
								],
							],
						},
					],
				]),
			};

			const items = collectRichDiagnosticItems(diagnostics);
			printRichDiagnosticItems(items, printer);

			const result = output.getOutput();
			assert.ok(result.includes("❌ test.ts:1 - code"));
			assert.ok(result.includes("Location issue"));
			assert.ok(!result.endsWith("\n\n")); // Should not have trailing empty line
		});
	});
});
