import assert from "node:assert";
import { describe, it } from "node:test";
import type ts from "typescript";
import type { MarkupRootElement } from "../../diagnostics/markup/types.ts";
import type { FileInspectionResult } from "../../inspector/index.ts";
import { resultsBuilder } from "./results-builder.ts";
import type { TypeAssertionFindings } from "./types.ts";

/**
 * Creates a mock FileInspectionResult for testing.
 * Uses minimal SourceFile mock - type assertion allowed for isolated test utility.
 */
function createMockFileInspectionResult(
	fileName: string,
	findings: TypeAssertionFindings,
): FileInspectionResult<TypeAssertionFindings> {
	return {
		srcFile: {
			file: { fileName } as ts.SourceFile, // Minimal mock for testing
			metadata: {
				fileType: "ts",
				isDeclaration: false,
				isTest: false,
			},
		},
		finalState: findings,
	};
}

describe("builtin-inspectors/no-type-assertions/results-builder", () => {
	describe("resultsBuilder", () => {
		it("returns structured result when type assertions are found", () => {
			const mockResults = [
				createMockFileInspectionResult("test.ts", [
					{ line: 1, snippet: "value as any" },
					{ line: 2, snippet: "data as string" },
				]),
			];

			const result = resultsBuilder(mockResults);

			assert.strictEqual(result.inspectorName, "no-type-assertions");

			const diagnostics = result.diagnostics;
			assert.strictEqual(diagnostics.type, "simple");
			assert.strictEqual(diagnostics.details.message, "Found suspicious type assertions.");

			// Verify instructions is a MarkupRootElement with expected structure
			const instructions = diagnostics.details.instructions as MarkupRootElement;
			assert.ok(instructions);
			assert.strictEqual(instructions.type, "element");
			assert.strictEqual(instructions.name, "markup");
			assert.ok(instructions.children.length >= 2); // hint + ordered list

			// Check that first child is a hint paragraph
			const firstChild = instructions.children[0];
			assert.strictEqual(firstChild.type, "element");
			if (firstChild.type === "element") {
				assert.strictEqual(firstChild.name, "paragraph");
				assert.strictEqual(firstChild.attributes.intention, "hint");
			}
			const testFileScope = diagnostics.perFile.get("test.ts");
			assert.ok(testFileScope);
			assert.strictEqual(testFileScope.locations.length, 2);

			const [location0, finding0] = testFileScope.locations[0];
			assert.deepStrictEqual(location0, { line: 1, snippet: "value as any" });
			assert.deepStrictEqual(finding0, { severity: "error" });

			const [location1, finding1] = testFileScope.locations[1];
			assert.deepStrictEqual(location1, { line: 2, snippet: "data as string" });
			assert.deepStrictEqual(finding1, { severity: "error" });
		});

		it("returns empty diagnostics when no assertions found", () => {
			const result = resultsBuilder([]);

			assert.strictEqual(result.inspectorName, "no-type-assertions");
			const diagnostics = result.diagnostics;
			assert.strictEqual(diagnostics.type, "simple");
			assert.strictEqual(diagnostics.details.message, "No suspicious type assertions found.");
			assert.strictEqual(diagnostics.details.instructions, undefined);
			assert.strictEqual(diagnostics.perFile.size, 0);
		});

		it("handles multiple files with assertions", () => {
			const mockResults = [
				createMockFileInspectionResult("test1.ts", [{ line: 1, snippet: "value as any" }]),
				createMockFileInspectionResult("test2.ts", [{ line: 5, snippet: "data as string" }]),
			];
			const result = resultsBuilder(mockResults);

			const diagnostics = result.diagnostics;
			assert.strictEqual(diagnostics.type, "simple");
			assert.strictEqual(diagnostics.perFile.size, 2);
			assert.ok(diagnostics.perFile.has("test1.ts"));
			assert.ok(diagnostics.perFile.has("test2.ts"));

			const test1FileScope = diagnostics.perFile.get("test1.ts");
			assert.ok(test1FileScope);
			assert.strictEqual(test1FileScope.locations.length, 1);
			const [location1, finding1] = test1FileScope.locations[0];
			assert.deepStrictEqual(location1, { line: 1, snippet: "value as any" });
			assert.deepStrictEqual(finding1, { severity: "error" });

			const test2FileScope = diagnostics.perFile.get("test2.ts");
			assert.ok(test2FileScope);
			assert.strictEqual(test2FileScope.locations.length, 1);
			const [location2, finding2] = test2FileScope.locations[0];
			assert.deepStrictEqual(location2, { line: 5, snippet: "data as string" });
			assert.deepStrictEqual(finding2, { severity: "error" });
		});
	});
});
