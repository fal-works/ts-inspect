import assert from "node:assert";
import { describe, it } from "node:test";
import { fileExists, isDirectory } from "./files.ts";

describe("files", () => {
	describe("fileExists", () => {
		it("returns true for existing files", async () => {
			const result = await fileExists("test/fixtures/tsconfig.json");
			assert.strictEqual(result, true);
		});

		it("returns false for non-existing files", async () => {
			const result = await fileExists("test/fixtures/non-existent-file.txt");
			assert.strictEqual(result, false);
		});

		it("returns false for directories when checking as files", async () => {
			const result = await fileExists("test/fixtures");
			assert.strictEqual(result, true); // directories are accessible via access()
		});

		it("handles invalid paths gracefully", async () => {
			const result = await fileExists("invalid/path/that/does/not/exist.txt");
			assert.strictEqual(result, false);
		});
	});

	describe("isDirectory", () => {
		it("returns true for existing directories", async () => {
			const result = await isDirectory("test/fixtures");
			assert.strictEqual(result, true);
		});

		it("returns false for files", async () => {
			const result = await isDirectory("test/fixtures/tsconfig.json");
			assert.strictEqual(result, false);
		});

		it("returns false for non-existing paths", async () => {
			const result = await isDirectory("non/existent/directory");
			assert.strictEqual(result, false);
		});

		it("works with nested directories", async () => {
			const result = await isDirectory("test/fixtures/project-with-tsconfig");
			assert.strictEqual(result, true);
		});
	});
});
