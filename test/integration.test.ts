/**
 * Integration tests for the ts-inspect library.
 */

import assert from "node:assert";
import { join } from "node:path";
import { describe, it } from "node:test";
import { TsInspectError } from "../src/error/index.ts";
import { inspectFiles, inspectProject } from "../src/index.ts";
import {
	createRawJsonReporter,
	createSummaryReporter,
} from "../src/main/builtin-reporters/index.ts";
import type { Reporter } from "../src/reporter/index.ts";
import { mockWritable } from "./test-utils.ts";

describe("integration", () => {
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
			const malformedInspector: any = null;

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

		it("accepts rawJsonReporter without error", async () => {
			const filePaths = [join("test", "fixtures", "src", "sample.ts")];

			const result = await inspectFiles(filePaths, {
				reporter: createRawJsonReporter(),
			});
			assert.ok(result === null || ["error", "warning", "info"].includes(result));
		});

		it("accepts summaryReporter explicitly without error", async () => {
			const filePaths = [join("test", "fixtures", "src", "sample.ts")];

			const result = await inspectFiles(filePaths, {
				reporter: createSummaryReporter(),
			});
			assert.ok(result === null || ["error", "warning", "info"].includes(result));
		});

		it("accepts custom reporter without error", async () => {
			const filePaths = [join("test", "fixtures", "src", "sample.ts")];
			const customReporter: Reporter = (results, output) => {
				// Simple custom reporter for testing
				output.write(`Custom: ${results.length} results\n`);
			};

			const result = await inspectFiles(filePaths, {
				reporter: customReporter,
			});
			assert.ok(result === null || ["error", "warning", "info"].includes(result));
		});

		it("accepts custom output stream", async () => {
			const filePaths = [join("test", "fixtures", "src", "sample.ts")];

			// Create a mock writable stream to capture output
			const mockOutput = mockWritable();

			const result = await inspectFiles(filePaths, {
				output: mockOutput,
			});

			assert.ok(result === null || ["error", "warning", "info"].includes(result));
			// Output should be captured in our mock stream instead of going to stdout
			assert.ok(typeof mockOutput.getOutput() === "string");
		});

		it("uses custom output stream with custom reporter", async () => {
			const filePaths = [
				join("test", "fixtures", "project-with-type-assertions", "src", "sample.ts"),
			];

			// Create a mock writable stream to capture output
			const mockOutput = mockWritable();

			const customReporter: Reporter = (results, output) => {
				output.write(`TEST: Found ${results.length} results\n`);
			};

			const result = await inspectFiles(filePaths, {
				reporter: customReporter,
				output: mockOutput,
			});

			assert.strictEqual(result, "error"); // Should find type assertions
			assert.strictEqual(mockOutput.getOutput(), "TEST: Found 1 results\n");
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
});
