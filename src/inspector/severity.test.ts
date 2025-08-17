/**
 * Unit tests for severity module.
 */

import assert from "node:assert";
import { describe, it } from "node:test";
import {
	type DiagnosticSeverity,
	getWorstSeverityFromArray,
	translateSeverityToExitCode,
} from "./severity.ts";

describe("inspector/severity", () => {
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

	describe("translateSeverityToExitCode", () => {
		it("returns 1 for error severity", () => {
			assert.strictEqual(translateSeverityToExitCode("error"), 1);
		});

		it("returns 0 for warning severity", () => {
			assert.strictEqual(translateSeverityToExitCode("warning"), 0);
		});

		it("returns 0 for info severity", () => {
			assert.strictEqual(translateSeverityToExitCode("info"), 0);
		});

		it("returns 0 for null severity (no issues)", () => {
			assert.strictEqual(translateSeverityToExitCode(null), 0);
		});
	});
});
