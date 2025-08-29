import assert from "node:assert";
import { describe, it } from "node:test";
import { TsInspectError } from "../../error.ts";
import { resolveProjectPath } from "./resolver.ts";

describe("orchestrator/tsconfig/resolver", () => {
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

		it("throws TsInspectError with invalid-project-path for non-existent directory", async () => {
			await assert.rejects(
				async () => await resolveProjectPath("non/existent/directory"),
				(error: unknown) => {
					assert.ok(error instanceof TsInspectError);
					assert.strictEqual(error.type.errorCode, "invalid-project-path");
					assert.ok(typeof error.type.path === "string");
					assert.ok(error.type.path.length > 0);
					return true;
				},
			);
		});

		it("throws TsInspectError with config-file-not-found for directory without config files", async () => {
			await assert.rejects(
				async () => await resolveProjectPath("test/fixtures/empty-directory"),
				(error: unknown) => {
					assert.ok(error instanceof TsInspectError);
					assert.strictEqual(error.type.errorCode, "config-file-not-found");
					assert.ok(error.type.directoryPath.includes("empty-directory"));
					return true;
				},
			);
		});

		it("throws TsInspectError with invalid-project-path for file that is not a directory and not a .json file", async () => {
			await assert.rejects(
				async () => await resolveProjectPath("src/index.ts"),
				(error: unknown) => {
					assert.ok(error instanceof TsInspectError);
					assert.strictEqual(error.type.errorCode, "invalid-project-path");
					assert.ok(typeof error.type.path === "string");
					assert.ok(error.type.path.length > 0);
					return true;
				},
			);
		});
	});
});
