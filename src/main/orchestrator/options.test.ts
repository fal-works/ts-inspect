/**
 * Unit tests for orchestrator options module.
 */

import assert from "node:assert";
import { join } from "node:path";
import { describe, it } from "node:test";
import { type InspectOptions, inferOptionsFromProject } from "./options.ts";

describe("main/orchestrator/options", () => {
	describe("inferOptionsFromProject", () => {
		it("infers options from tsconfig.json project", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			const result = await inferOptionsFromProject(projectPath);

			assert.ok(result.options);
			assert.ok(result.fileNames);
			assert.ok(Array.isArray(result.fileNames));
			assert.ok(result.fileNames.length > 0);
			assert.ok(result.options.sourceFilesOptions);
		});

		it("infers options from jsconfig.json project", async () => {
			const projectPath = join("test", "fixtures", "project-with-jsconfig");
			const result = await inferOptionsFromProject(projectPath);

			assert.ok(result.options);
			assert.ok(result.fileNames);
			assert.ok(Array.isArray(result.fileNames));
			assert.ok(result.fileNames.length > 0);
			assert.ok(result.options.sourceFilesOptions);
		});

		it("merges base options with inferred options", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			const baseOptions: InspectOptions = {
				inspectors: [],
			};

			const result = await inferOptionsFromProject(projectPath, baseOptions);

			assert.ok(result.options);
			assert.strictEqual(result.options.inspectors, baseOptions.inspectors);
			assert.ok(result.options.sourceFilesOptions);
		});

		it("uses current directory when no project path specified", async () => {
			const result = await inferOptionsFromProject();

			assert.ok(result.options);
			assert.ok(result.fileNames);
			assert.ok(Array.isArray(result.fileNames));
			assert.ok(result.options.sourceFilesOptions);
		});

		it("preserves existing sourceFilesOptions when merging", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			const baseOptions: InspectOptions = {
				sourceFilesOptions: {
					excludeTest: true,
				},
			};

			const result = await inferOptionsFromProject(projectPath, baseOptions);

			assert.ok(result.options.sourceFilesOptions);
			// Should merge the existing options with inferred ones
			assert.strictEqual(result.options.sourceFilesOptions.excludeTest, true);
			assert.ok(result.options.sourceFilesOptions.fileTypes);
		});
	});
});
