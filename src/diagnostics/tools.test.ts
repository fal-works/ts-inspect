/**
 * Unit tests for diagnostics tools module.
 */

import assert from "node:assert";
import { describe, it } from "node:test";
import {
	type DiagnosticSeverity,
	getOverallWorstSeverity,
	getWorstSeverity,
	getWorstSeverityFromArray,
} from "./index.ts";
import { createTestRichDiagnostics, createTestSimpleDiagnostics } from "./test-helpers.ts";

describe("diagnostics/tools", () => {
	describe("getWorstSeverityFromArray", () => {
		it("returns null for empty array", () => {
			const result = getWorstSeverityFromArray([]);
			assert.strictEqual(result, null);
		});

		it("returns the only severity for single item array", () => {
			assert.strictEqual(getWorstSeverityFromArray(["error"]), "error");
			assert.strictEqual(getWorstSeverityFromArray(["warning"]), "warning");
			assert.strictEqual(getWorstSeverityFromArray(["info"]), "info");
		});

		it("returns error when error is present with other severities", () => {
			assert.strictEqual(getWorstSeverityFromArray(["info", "error", "warning"]), "error");
			assert.strictEqual(getWorstSeverityFromArray(["warning", "error"]), "error");
			assert.strictEqual(getWorstSeverityFromArray(["error", "info"]), "error");
		});

		it("returns warning when warning is worst (no errors)", () => {
			assert.strictEqual(getWorstSeverityFromArray(["info", "warning", "info"]), "warning");
			assert.strictEqual(getWorstSeverityFromArray(["warning", "info"]), "warning");
		});

		it("returns info when only info severities present", () => {
			assert.strictEqual(getWorstSeverityFromArray(["info", "info", "info"]), "info");
		});

		it("handles duplicate severities correctly", () => {
			assert.strictEqual(getWorstSeverityFromArray(["error", "error", "error"]), "error");
			assert.strictEqual(getWorstSeverityFromArray(["warning", "warning"]), "warning");
		});

		it("prioritizes error > warning > info regardless of order", () => {
			const allCombinations: DiagnosticSeverity[][] = [
				["error", "warning", "info"],
				["error", "info", "warning"],
				["warning", "error", "info"],
				["warning", "info", "error"],
				["info", "error", "warning"],
				["info", "warning", "error"],
			];

			for (const combination of allCombinations) {
				assert.strictEqual(
					getWorstSeverityFromArray(combination),
					"error",
					`Failed for combination: ${combination.join(", ")}`,
				);
			}
		});
	});

	describe("getWorstSeverity", () => {
		it("returns null for empty diagnostics", () => {
			const diagnostics = createTestSimpleDiagnostics({ message: "No issues found." }, []);
			assert.strictEqual(getWorstSeverity(diagnostics), null);
		});

		it("returns worst severity from simple diagnostics", () => {
			const diagnostics = createTestSimpleDiagnostics({ message: "Found mixed severity issues." }, [
				{ type: "location", severity: "warning", file: "test.ts", location: { line: 1 } },
				{ type: "location", severity: "error", file: "test.ts", location: { line: 2 } },
				{ type: "location", severity: "info", file: "test.ts", location: { line: 3 } },
			]);
			assert.strictEqual(getWorstSeverity(diagnostics), "error");
		});

		it("returns worst severity from rich diagnostics", () => {
			const diagnostics = createTestRichDiagnostics([
				{
					type: "location",
					severity: "info",
					file: "test.ts",
					location: { line: 1 },
					details: { message: "Info message" },
				},
				{
					type: "location",
					severity: "warning",
					file: "test.ts",
					location: { line: 2 },
					details: { message: "Warning message" },
				},
			]);
			assert.strictEqual(getWorstSeverity(diagnostics), "warning");
		});
	});

	describe("getOverallWorstSeverity", () => {
		it("returns null for empty results", () => {
			assert.strictEqual(getOverallWorstSeverity([]), null);
		});

		it("returns worst severity across multiple inspector results", () => {
			const results = [
				{
					diagnostics: createTestSimpleDiagnostics({ message: "Found warning." }, [
						{
							type: "location" as const,
							severity: "warning" as const,
							file: "test.ts",
							location: { line: 1 },
						},
					]),
				},
				{
					diagnostics: createTestSimpleDiagnostics({ message: "Found error." }, [
						{
							type: "location" as const,
							severity: "error" as const,
							file: "test.ts",
							location: { line: 2 },
						},
					]),
				},
				{
					diagnostics: createTestSimpleDiagnostics({ message: "Found info." }, [
						{
							type: "location" as const,
							severity: "info" as const,
							file: "test.ts",
							location: { line: 3 },
						},
					]),
				},
			];
			assert.strictEqual(getOverallWorstSeverity(results), "error");
		});

		it("returns null when all results have empty diagnostics", () => {
			const results = [
				{ diagnostics: createTestSimpleDiagnostics({ message: "No issues." }, []) },
				{ diagnostics: createTestSimpleDiagnostics({ message: "No issues." }, []) },
			];
			assert.strictEqual(getOverallWorstSeverity(results), null);
		});
	});
});
