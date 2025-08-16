/**
 * Integration tests for the main API (index.ts).
 */

import assert from "node:assert";
import { join } from "node:path";
import { describe, it } from "node:test";
import { inspectFiles, inspectProject } from "../src/index.ts";

describe("index", () => {
	describe("inspectFiles", () => {
		it("does not throw error with valid TypeScript files", async () => {
			const filePaths = [
				join("test", "fixtures", "src", "sample.ts"),
				join("test", "fixtures", "project-with-tsconfig", "src", "sample.ts"),
			];

			const result = await inspectFiles(filePaths);
			assert.strictEqual(typeof result, "string");
			assert.ok(["success", "warn", "error"].includes(result));
		});

		it("returns success status for empty file list", async () => {
			const result = await inspectFiles([]);
			assert.strictEqual(result, "success");
		});

		it("accepts custom inspector options without error", async () => {
			const filePaths = [join("test", "fixtures", "src", "sample.ts")];
			const result = await inspectFiles(filePaths, {
				inspectors: [],
			});
			assert.strictEqual(result, "success");
		});
	});

	describe("inspectProject", () => {
		it("does not throw error with tsconfig.json project", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			const result = await inspectProject(projectPath);
			assert.strictEqual(typeof result, "string");
			assert.ok(["success", "warn", "error"].includes(result));
		});

		it("does not throw error with jsconfig.json project", async () => {
			const projectPath = join("test", "fixtures", "project-with-jsconfig");
			const result = await inspectProject(projectPath);
			assert.strictEqual(typeof result, "string");
			assert.ok(["success", "warn", "error"].includes(result));
		});

		it("does not throw error when using default tsconfig discovery", async () => {
			const result = await inspectProject();
			assert.strictEqual(typeof result, "string");
			assert.ok(["success", "warn", "error"].includes(result));
		});

		it("accepts custom inspector options without error", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			const result = await inspectProject(projectPath, {
				inspectors: [],
			});
			assert.strictEqual(result, "success");
		});
	});
});