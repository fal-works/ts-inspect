/**
 * Unit tests for orchestrator executor module.
 */

import assert from "node:assert";
import { join } from "node:path";
import { describe, it } from "node:test";
import { mockWritable } from "../../test/test-utils.ts";
import type { Inspector } from "../inspector/index.ts";
import type { Reporter } from "../reporter/index.ts";
import { inspectFiles, inspectProject } from "./executor.ts";
import type { InspectOptions } from "./options.ts";

describe("orchestrator/executor", () => {
	describe("inspectFiles", () => {
		it("returns null for empty file list", async () => {
			const result = await inspectFiles([]);
			assert.strictEqual(result, null);
		});

		it("returns null when no inspectors are provided", async () => {
			const filePaths = [join("test", "fixtures", "src", "sample.ts")];
			const options: InspectOptions = {
				inspectors: [],
			};

			const result = await inspectFiles(filePaths, options);
			assert.strictEqual(result, null);
		});

		it("processes files with default inspectors", async () => {
			const filePaths = [
				join("test", "fixtures", "project-with-type-assertions", "src", "sample.ts"),
			];

			const result = await inspectFiles(filePaths);
			assert.strictEqual(result, "error"); // Should find type assertions
		});

		it("uses custom reporter when provided", async () => {
			const filePaths = [join("test", "fixtures", "src", "sample.ts")];
			const mockOutput = mockWritable();

			const customReporter: Reporter = (results, output) => {
				output.write(`CUSTOM: ${results.length}\n`);
			};

			const options: InspectOptions = {
				reporter: customReporter,
				output: mockOutput,
			};

			await inspectFiles(filePaths, options);
			assert.strictEqual(mockOutput.getOutput(), "CUSTOM: 1\n");
		});

		it("uses custom output stream when provided", async () => {
			const filePaths = [
				join("test", "fixtures", "project-with-type-assertions", "src", "sample.ts"),
			];
			const mockOutput = mockWritable();

			const options: InspectOptions = {
				output: mockOutput,
			};

			await inspectFiles(filePaths, options);
			assert.ok(mockOutput.getOutput().length > 0);
		});

		it("processes files with custom inspector", async () => {
			const filePaths = [join("test", "fixtures", "src", "sample.ts")];

			const testInspector: Inspector<number> = {
				name: "test-inspector",
				nodeInspectorFactory: () => () => undefined,
				resultsBuilder: () => ({
					inspectorName: "test-inspector",
					diagnostics: {
						type: "simple",
						details: { message: "Test passed" },
						perFile: new Map(),
					},
				}),
			};

			const options: InspectOptions = {
				inspectors: [testInspector],
			};

			const result = await inspectFiles(filePaths, options);
			assert.strictEqual(result, null);
		});
	});

	describe("inspectProject", () => {
		it("processes project with tsconfig.json", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			const result = await inspectProject(projectPath);
			assert.ok(result === null || ["error", "warning", "info"].includes(result));
		});

		it("processes project with jsconfig.json", async () => {
			const projectPath = join("test", "fixtures", "project-with-jsconfig");
			const result = await inspectProject(projectPath);
			assert.ok(result === null || ["error", "warning", "info"].includes(result));
		});

		it("uses current directory when no project path specified", async () => {
			const result = await inspectProject();
			assert.ok(result === null || ["error", "warning", "info"].includes(result));
		});

		it("accepts custom options", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			const options: InspectOptions = {
				inspectors: [],
			};

			const result = await inspectProject(projectPath, options);
			assert.strictEqual(result, null);
		});
	});
});
