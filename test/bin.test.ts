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

		it("executes without error with --exclude-test argument", async () => {
			const { stdout, stderr } = await execFileAsync("node", [binPath, "--exclude-test"], {
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

		it("exits with code 2 for non-existent project (fatal error)", async () => {
			const nonExistentPath = join("test", "fixtures", "non-existent-project");
			try {
				await execFileAsync("node", [binPath, "--project", nonExistentPath], {
					cwd: process.cwd(),
				});
				assert.fail("Expected command to throw an error for non-existent project");
			} catch (error) {
				// Should exit with code 2 for fatal configuration error
				assert.ok(error instanceof Error);
				assert.ok("code" in error);
				assert.strictEqual(error.code, 2);
				// Should output error to stderr
				assert.ok("stderr" in error);
				assert.ok(typeof error.stderr === "string");
				assert.ok(error.stderr.length > 0);
			}
		});

		it("exits with code 2 for unknown option (fatal error)", async () => {
			try {
				await execFileAsync("node", [binPath, "--unknown-option"], {
					cwd: process.cwd(),
				});
				assert.fail("Expected command to throw an error for unknown option");
			} catch (error) {
				// Should exit with code 2 for argument parsing error
				assert.ok(error instanceof Error);
				assert.ok("code" in error);
				assert.strictEqual(error.code, 2);
			}
		});

		it("exits with code 2 for invalid project path format", async () => {
			try {
				await execFileAsync("node", [binPath, "--project", "src/index.ts"], {
					cwd: process.cwd(),
				});
				assert.fail("Expected command to throw an error for invalid project path");
			} catch (error) {
				// Should exit with code 2 for fatal configuration error (not a directory or JSON file)
				assert.ok(error instanceof Error);
				assert.ok("code" in error);
				assert.strictEqual(error.code, 2);
				// Should output error to stderr
				assert.ok("stderr" in error);
				assert.ok(typeof error.stderr === "string");
				assert.ok(error.stderr.includes("TsInspectError"));
			}
		});
	});
});
