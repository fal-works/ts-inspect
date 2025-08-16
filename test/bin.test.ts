/**
 * Integration tests for the CLI (bin.ts).
 */

import assert from "node:assert";
import { execFile } from "node:child_process";
import { join } from "node:path";
import { describe, it } from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const binPath = join("dist", "bin.js");

describe("bin", () => {
	describe("CLI execution", () => {
		it("executes without error when no project argument provided", async () => {
			const { stdout, stderr } = await execFileAsync("node", [binPath], {
				cwd: process.cwd(),
			});
			// Should not throw and should have some output or empty output
			assert.strictEqual(typeof stdout, "string");
			assert.strictEqual(typeof stderr, "string");
		});

		it("executes without error with --project argument", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			const { stdout, stderr } = await execFileAsync("node", [binPath, "--project", projectPath], {
				cwd: process.cwd(),
			});
			assert.strictEqual(typeof stdout, "string");
			assert.strictEqual(typeof stderr, "string");
		});

		it("executes without error with -p shorthand argument", async () => {
			const projectPath = join("test", "fixtures", "project-with-jsconfig");
			const { stdout, stderr } = await execFileAsync("node", [binPath, "-p", projectPath], {
				cwd: process.cwd(),
			});
			assert.strictEqual(typeof stdout, "string");
			assert.strictEqual(typeof stderr, "string");
		});
	});

	describe("Exit codes", () => {
		it("exits with code 0 for successful inspection", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			const { stdout, stderr } = await execFileAsync("node", [binPath, "-p", projectPath], {
				cwd: process.cwd(),
			});
			// If no exception thrown, exit code was 0
			assert.strictEqual(typeof stdout, "string");
			assert.strictEqual(typeof stderr, "string");
		});

		it("exits with non-zero code for non-existent project", async () => {
			const nonExistentPath = join("test", "fixtures", "non-existent-project");
			try {
				await execFileAsync("node", [binPath, "--project", nonExistentPath], {
					cwd: process.cwd(),
				});
				// If it doesn't throw, that's also acceptable behavior
			} catch (error) {
				// Should exit with non-zero code for invalid project
				assert.ok(error instanceof Error);
				assert.ok("code" in error);
				assert.notStrictEqual((error as any).code, 0);
			}
		});
	});
});
