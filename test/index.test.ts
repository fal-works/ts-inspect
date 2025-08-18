/**
 * Integration tests for the main API (index.ts).
 */

import assert from "node:assert";
import { readFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileExists } from "../src/core/files.ts";
import { TsInspectError } from "../src/error.ts";
import {
	inspectFiles,
	inspectProject,
	type Reporter,
	rawJsonReporter,
	summaryReporter,
} from "../src/index.ts";
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

		it("accepts rawJsonReporter without error", async () => {
			const filePaths = [join("test", "fixtures", "src", "sample.ts")];

			const result = await inspectFiles(filePaths, {
				reporter: rawJsonReporter,
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
			let capturedOutput = "";
			const mockOutput = {
				write: (chunk: string) => {
					capturedOutput += chunk;
					return true;
				},
				end: () => {},
			} as any;

			const result = await inspectFiles(filePaths, {
				output: mockOutput,
			});

			assert.ok(result === null || ["error", "warning", "info"].includes(result));
			// Output should be captured in our mock stream instead of going to stdout
			assert.ok(typeof capturedOutput === "string");
		});

		it("uses custom output stream with custom reporter", async () => {
			const filePaths = [
				join("test", "fixtures", "project-with-type-assertions", "src", "sample.ts"),
			];

			// Create a mock writable stream to capture output
			let capturedOutput = "";
			const mockOutput = {
				write: (chunk: string) => {
					capturedOutput += chunk;
					return true;
				},
				end: () => {},
			} as any;

			const customReporter: Reporter = (results, output) => {
				output.write(`TEST: Found ${results.length} results\n`);
			};

			const result = await inspectFiles(filePaths, {
				reporter: customReporter,
				output: mockOutput,
			});

			assert.strictEqual(result, "error"); // Should find type assertions
			assert.strictEqual(capturedOutput, "TEST: Found 1 results\n");
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

	describe("custom reporter integration", () => {
		it("can run examples/custom-reporter.ts script", async () => {
			const customReporterPath = join("examples", "custom-reporter.ts");

			const result = await executeNodeScript(customReporterPath);

			// The script should run with error findings (exit code 1) and use custom formatting
			assert.strictEqual(result.code, 1);
			assert.ok(result.stdout.includes("Found 1 inspector results")); // custom reporter output
			assert.ok(result.stdout.includes("no-type-assertions:")); // custom inspector name format
			assert.strictEqual(result.stderr, ""); // tool/config/runtime errors go to stderr
		});
	});

	describe("output to file integration", () => {
		it("can run examples/output-to-file.ts script", async () => {
			const outputToFilePath = join("examples", "output-to-file.ts");

			const result = await executeNodeScript(outputToFilePath);

			// The script should run with error findings (exit code 1) and write to file
			assert.strictEqual(result.code, 1);
			assert.ok(result.stdout.includes("Results written to inspection-results.txt")); // console output
			assert.strictEqual(result.stderr, ""); // tool/config/runtime errors go to stderr

			// Verify the output file was created and contains expected content
			const outputFilePath = "inspection-results.txt";
			assert.ok(await fileExists(outputFilePath));

			const fileContent = await readFile(outputFilePath, "utf-8");
			assert.ok(fileContent.includes("no-type-assertions")); // inspector name should be in output

			// Clean up the output file
			await unlink(outputFilePath);
		});
	});
});
