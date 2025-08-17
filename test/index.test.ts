/**
 * Integration tests for the main API (index.ts).
 */

import assert from "node:assert";
import { join } from "node:path";
import { describe, it } from "node:test";
import { TsInspectError } from "../src/error.ts";
import { inspectFiles, inspectProject, jsonReporter, summaryReporter } from "../src/index.ts";
import { executeNodeScript } from "./test-utils.ts";

describe("index", () => {
	describe("inspectFiles", () => {
		it("does not throw error with valid TypeScript files", async () => {
			const filePaths = [
				join("test", "fixtures", "src", "sample.ts"),
				join("test", "fixtures", "project-with-tsconfig", "src", "sample.ts"),
			];

			const result = await inspectFiles(filePaths);
			assert.ok(result === null || ["error", "warning", "info"].includes(result));
		});

		it("returns null status for empty file list", async () => {
			const result = await inspectFiles([]);
			assert.strictEqual(result, null);
		});

		it("accepts custom inspector options without error", async () => {
			const filePaths = [join("test", "fixtures", "src", "sample.ts")];
			const result = await inspectFiles(filePaths, {
				inspectors: [],
			});
			assert.strictEqual(result, null);
		});

		it("wraps unexpected exceptions with TsInspectError", async () => {
			// Test with a completely malformed inspector to trigger an error before inspection
			const malformedInspector = null as any;

			await assert.rejects(
				async () => {
					return await inspectFiles(["test/fixtures/src/sample.ts"], {
						inspectors: [malformedInspector],
					});
				},
				(error: unknown) => {
					assert.ok(error instanceof TsInspectError);
					assert.strictEqual(error.type.errorCode, "unexpected-exception");
					assert.ok(error.type.caught instanceof TypeError);
					return true;
				},
			);
		});

		it("accepts jsonReporter without error", async () => {
			const filePaths = [join("test", "fixtures", "src", "sample.ts")];

			const result = await inspectFiles(filePaths, {
				reporter: jsonReporter,
			});
			assert.ok(result === null || ["error", "warning", "info"].includes(result));
		});

		it("accepts summaryReporter explicitly without error", async () => {
			const filePaths = [join("test", "fixtures", "src", "sample.ts")];

			const result = await inspectFiles(filePaths, {
				reporter: summaryReporter,
			});
			assert.ok(result === null || ["error", "warning", "info"].includes(result));
		});

				it("accepts custom reporter without error", async () => {
			const filePaths = [join("test", "fixtures", "src", "sample.ts")];
			const customReporter = (results: any, output: any) => {
				// Simple custom reporter for testing
				output.write(`Custom: ${results.length} results\n`);
			};

			const result = await inspectFiles(filePaths, {
				reporter: customReporter,
			});
			assert.ok(result === null || ["error", "warning", "info"].includes(result));
		});
	});

	describe("inspectProject", () => {
		it("does not throw error with tsconfig.json project", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			const result = await inspectProject(projectPath);
			assert.ok(result === null || ["error", "warning", "info"].includes(result));
		});

		it("does not throw error with jsconfig.json project", async () => {
			const projectPath = join("test", "fixtures", "project-with-jsconfig");
			const result = await inspectProject(projectPath);
			assert.ok(result === null || ["error", "warning", "info"].includes(result));
		});

		it("does not throw error when using default tsconfig discovery", async () => {
			const result = await inspectProject();
			assert.ok(result === null || ["error", "warning", "info"].includes(result));
		});

		it("accepts custom inspector options without error", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			const result = await inspectProject(projectPath, {
				inspectors: [],
			});
			assert.strictEqual(result, null);
		});

		it("throws TsInspectError for known configuration errors", async () => {
			// Test with non-existent project path - should be a known TsInspectError, not wrapped
			await assert.rejects(
				async () => await inspectProject("/completely/non/existent/project"),
				(error: unknown) => {
					assert.ok(error instanceof TsInspectError);
					// Should be invalid-project-path, not unexpected-exception
					assert.strictEqual(error.type.errorCode, "invalid-project-path");
					return true;
				},
			);
		});
	});

	describe("custom inspector integration", () => {
		it("can run examples/custom-inspector.ts script", async () => {
			const customInspectorPath = join("examples", "custom-inspector.ts");

			const result = await executeNodeScript(customInspectorPath);

			// The script should run with error findings (exit code 1) and detect console.log calls
			assert.strictEqual(result.code, 1);
			assert.ok(result.stdout.includes("console.log calls")); // findings go to stdout
			assert.strictEqual(result.stderr, ""); // tool/config/runtime errors go to stderr
		});
	});
});
