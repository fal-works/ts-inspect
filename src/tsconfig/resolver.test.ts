import assert from "node:assert";
import { describe, it } from "node:test";
import { resolveProjectPath } from "./resolver.ts";

describe("resolver", () => {
	describe("resolveProjectPath", () => {
		it("returns the path directly for .json files", async () => {
			const result = await resolveProjectPath("test/fixtures/tsconfig.json");
			assert.strictEqual(result, "test/fixtures/tsconfig.json");
		});

		it("finds tsconfig.json in a directory", async () => {
			const result = await resolveProjectPath("test/fixtures/project-with-tsconfig");
			assert.ok(result.endsWith("tsconfig.json"));
			assert.ok(result.includes("project-with-tsconfig"));
		});

		it("finds jsconfig.json in a directory when tsconfig.json is not present", async () => {
			const result = await resolveProjectPath("test/fixtures/project-with-jsconfig");
			assert.ok(result.endsWith("jsconfig.json"));
			assert.ok(result.includes("project-with-jsconfig"));
		});

		it("prefers tsconfig.json over jsconfig.json when both exist", async () => {
			const result = await resolveProjectPath("test/fixtures");
			assert.ok(result.endsWith("tsconfig.json"));
			assert.ok(result.includes("fixtures"));
		});

		it("defaults to current directory when no path provided", async () => {
			const result = await resolveProjectPath();
			assert.ok(result.endsWith(".json"));
		});

		it("throws error for non-existent directory", async () => {
			await assert.rejects(
				async () => await resolveProjectPath("non/existent/directory"),
				/The specified project path is neither a JSON file nor a directory/,
			);
		});

		it("throws error for directory without config files", async () => {
			await assert.rejects(
				async () => await resolveProjectPath("test/fixtures/empty-directory"),
				/No tsconfig.json or jsconfig.json found in directory/,
			);
		});

		it("throws error for file that is not a directory and not a .json file", async () => {
			// Create a temporary non-json file for this test
			await assert.rejects(
				async () => await resolveProjectPath("src/index.ts"),
				/The specified project path is neither a JSON file nor a directory/,
			);
		});
	});
});
