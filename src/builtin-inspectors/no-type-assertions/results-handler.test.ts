import assert from "node:assert";
import { describe, it } from "node:test";
import type { SimpleLocationDiagnostic } from "../../inspector/index.ts";
import { defaultResultsBuilder } from "./results-handler.ts";

describe("builtin-inspectors/no-type-assertions/results-handler", () => {
	describe("defaultResultsBuilder", () => {
		it("returns structured result when type assertions are found", () => {
			const mockResults = [
				{
					srcFile: {
						file: { fileName: "test.ts" },
					} as any,
					result: [
						{ line: 1, snippet: "value as any" },
						{ line: 2, snippet: "data as string" },
					],
				},
			];

			const result = defaultResultsBuilder(mockResults);

			assert.strictEqual(result.inspectorName, "no-type-assertions");
			assert.strictEqual(result.message, "Found suspicious type assertions.");
			assert.ok(result.advices?.includes("Tip:"));

			const diagnostics = result.diagnostics as SimpleLocationDiagnostic[];
			assert.strictEqual(diagnostics.length, 2);

			assert.deepStrictEqual(diagnostics[0], {
				type: "location-simple",
				severity: "error",
				file: "test.ts",
				line: 1,
				snippet: "value as any",
			});

			assert.deepStrictEqual(diagnostics[1], {
				type: "location-simple",
				severity: "error",
				file: "test.ts",
				line: 2,
				snippet: "data as string",
			});
		});

		it("returns empty diagnostics when no assertions found", () => {
			const result = defaultResultsBuilder([]);

			assert.strictEqual(result.inspectorName, "no-type-assertions");
			assert.strictEqual(result.diagnostics.length, 0);
			assert.strictEqual(result.message, undefined);
			assert.strictEqual(result.advices, undefined);
		});

		it("handles multiple files with assertions", () => {
			const mockResults = [
				{
					srcFile: { file: { fileName: "test1.ts" } } as any,
					result: [{ line: 1, snippet: "value as any" }],
				},
				{
					srcFile: { file: { fileName: "test2.ts" } } as any,
					result: [{ line: 5, snippet: "data as string" }],
				},
			];
			const result = defaultResultsBuilder(mockResults);

			const diagnostics = result.diagnostics as SimpleLocationDiagnostic[];
			assert.strictEqual(diagnostics.length, 2);
			assert.strictEqual(diagnostics[0].file, "test1.ts");
			assert.strictEqual(diagnostics[1].file, "test2.ts");
		});
	});
});
