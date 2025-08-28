/**
 * Integration tests for examples/ directory scripts.
 */

import assert from "node:assert";
import { readFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileExists } from "../src/internal/utils/file-system.ts";
import { executeNodeScript } from "./test-utils.ts";

describe("examples", () => {
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
