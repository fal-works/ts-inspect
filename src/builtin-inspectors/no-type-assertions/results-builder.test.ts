import assert from "node:assert";
import { describe, it } from "node:test";
import type { SimpleDiagnostics } from "../../diagnostics/index.ts";
import { resultsBuilder } from "./results-builder.ts";

describe("builtin-inspectors/no-type-assertions/results-builder", () => {
	describe("resultsBuilder", () => {
		it("returns structured result when type assertions are found", () => {
			const mockResults = [
				{
					srcFile: {
						file: { fileName: "test.ts" },
					} as any,
					finalState: [
						{ line: 1, snippet: "value as any" },
						{ line: 2, snippet: "data as string" },
					],
				},
			];

			const result = resultsBuilder(mockResults);

			assert.strictEqual(result.inspectorName, "no-type-assertions");
			assert.strictEqual(result.message, "Found suspicious type assertions.");
			assert.ok(result.advices?.includes("Tip:"));

			const diagnostics = result.diagnostics as SimpleDiagnostics;
			assert.strictEqual(diagnostics.type, "simple");
			assert.strictEqual(diagnostics.items.length, 2);

			assert.deepStrictEqual(diagnostics.items[0], {
				type: "location",
				severity: "error",
				file: "test.ts",
				location: {
					line: 1,
					snippet: "value as any",
				},
			});

			assert.deepStrictEqual(diagnostics.items[1], {
				type: "location",
				severity: "error",
				file: "test.ts",
				location: {
					line: 2,
					snippet: "data as string",
				},
			});
		});

		it("returns empty diagnostics when no assertions found", () => {
			const result = resultsBuilder([]);

			assert.strictEqual(result.inspectorName, "no-type-assertions");
			const diagnostics = result.diagnostics as SimpleDiagnostics;
			assert.strictEqual(diagnostics.type, "simple");
			assert.strictEqual(diagnostics.items.length, 0);
			assert.strictEqual(result.message, undefined);
			assert.strictEqual(result.advices, undefined);
		});

		it("handles multiple files with assertions", () => {
			const mockResults = [
				{
					srcFile: { file: { fileName: "test1.ts" } } as any,
					finalState: [{ line: 1, snippet: "value as any" }],
				},
				{
					srcFile: { file: { fileName: "test2.ts" } } as any,
					finalState: [{ line: 5, snippet: "data as string" }],
				},
			];
			const result = resultsBuilder(mockResults);

			const diagnostics = result.diagnostics as SimpleDiagnostics;
			assert.strictEqual(diagnostics.type, "simple");
			assert.strictEqual(diagnostics.items.length, 2);
			assert.strictEqual((diagnostics.items[0] as any).file, "test1.ts");
			assert.strictEqual((diagnostics.items[1] as any).file, "test2.ts");
		});
	});
});
