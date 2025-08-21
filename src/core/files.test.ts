import assert from "node:assert";
import { before, describe, it } from "node:test";
import { prepareTestOutputDirectory } from "../../test/test-utils.ts";
import { ensureDirectoryExists, fileExists, isDirectory } from "./files.ts";

describe("core/files", () => {
	before(async () => {
		await prepareTestOutputDirectory("test-out/files");
	});

	describe("fileExists", () => {
		it("returns true for existing files", async () => {
			const result = await fileExists("test/fixtures/tsconfig.json");
			assert.strictEqual(result, true);
		});

		it("returns false for non-existing files", async () => {
			const result = await fileExists("test/fixtures/non-existent-file.txt");
			assert.strictEqual(result, false);
		});

		it("returns true for existing directories", async () => {
			const result = await fileExists("test/fixtures");
			assert.strictEqual(result, true);
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

	describe("ensureDirectoryExists", () => {
		it("creates directory when it does not exist", async () => {
			const filePath = "test-out/files/new-dir/file.txt";
			const dirPath = "test-out/files/new-dir";

			// Ensure the directory doesn't exist first
			const dirExistsBefore = await isDirectory(dirPath);
			assert.strictEqual(dirExistsBefore, false);

			await ensureDirectoryExists(filePath);

			// Directory should now exist
			const dirExistsAfter = await isDirectory(dirPath);
			assert.strictEqual(dirExistsAfter, true);
		});

		it("succeeds when directory already exists", async () => {
			const filePath = "test/fixtures/existing-file.txt";

			// Should not throw - directory already exists
			await assert.doesNotReject(() => ensureDirectoryExists(filePath));
		});

		it("creates nested directories", async () => {
			const filePath = "test-out/files/nested/level1/level2/file.txt";

			await ensureDirectoryExists(filePath);

			// All nested directories should exist
			const level1Exists = await isDirectory("test-out/files/nested");
			const level2Exists = await isDirectory("test-out/files/nested/level1");
			const level3Exists = await isDirectory("test-out/files/nested/level1/level2");

			assert.strictEqual(level1Exists, true);
			assert.strictEqual(level2Exists, true);
			assert.strictEqual(level3Exists, true);
		});
	});
});
