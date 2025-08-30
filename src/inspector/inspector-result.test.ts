/**
 * Unit tests for inspector result types and utilities.
 */

import assert from "node:assert";
import { describe, it } from "node:test";
import type { SimpleDiagnostics } from "../diagnostics/index.ts";
import { getWorstSeverityFromInspectorResults } from "./inspector-result.ts";

describe("inspector/inspector-result", () => {
	describe("getWorstSeverityFromInspectorResults", () => {
		it("returns null for empty results", () => {
			assert.strictEqual(getWorstSeverityFromInspectorResults([]), null);
		});

		it("returns worst severity across multiple inspector results", () => {
			const warningDiagnostics: SimpleDiagnostics = {
				type: "simple",
				details: { message: "Found warning." },
				perFile: new Map([
					[
						"test.ts",
						{
							locations: [[{ line: 1, snippet: "warning code" }, { severity: "warning" }]],
						},
					],
				]),
			};

			const errorDiagnostics: SimpleDiagnostics = {
				type: "simple",
				details: { message: "Found error." },
				perFile: new Map([
					[
						"test.ts",
						{
							locations: [[{ line: 2, snippet: "error code" }, { severity: "error" }]],
						},
					],
				]),
			};

			const infoDiagnostics: SimpleDiagnostics = {
				type: "simple",
				details: { message: "Found info." },
				perFile: new Map([
					[
						"test.ts",
						{
							locations: [[{ line: 3, snippet: "info code" }, { severity: "info" }]],
						},
					],
				]),
			};

			const results = [
				{ diagnostics: warningDiagnostics },
				{ diagnostics: errorDiagnostics },
				{ diagnostics: infoDiagnostics },
			];
			assert.strictEqual(getWorstSeverityFromInspectorResults(results), "error");
		});

		it("returns null when all results have empty diagnostics", () => {
			const emptyDiagnostics: SimpleDiagnostics = {
				type: "simple",
				details: { message: "No issues." },
				perFile: new Map(),
			};

			const results = [{ diagnostics: emptyDiagnostics }, { diagnostics: emptyDiagnostics }];
			assert.strictEqual(getWorstSeverityFromInspectorResults(results), null);
		});
	});
});
