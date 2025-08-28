/**
 * Integration tests for the CLI (bin.ts).
 */

import assert from "node:assert";
import { execFile as execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { before, describe, it } from "node:test";
import { promisify } from "node:util";
import { prepareTestOutputDirectory } from "./test-utils.ts";

const execFile = promisify(execFileSync);

const binPath = join("dist", "bin.js");

describe("bin", () => {
	before(async () => {
		await prepareTestOutputDirectory("test-out/bin");
	});

	describe("CLI execution", () => {
		it("executes when no project argument provided (may find issues)", async () => {
			try {
				const { stdout, stderr } = await execFile("node", [binPath], {
					cwd: process.cwd(),
				});
				// execFile resolves only if exit code is 0 (success - no issues found)
				assert.strictEqual(typeof stdout, "string");
				assert.strictEqual(typeof stderr, "string");
			} catch (error) {
				// If non-zero exit code, should be exit code 1 (issues found) not 2 (fatal error)
				assert.ok(error instanceof Error);
				assert.ok("code" in error);
				assert.ok(error.code === 1, `Expected exit code 1 but got ${error.code}`);
				assert.ok("stdout" in error);
				assert.strictEqual(typeof error.stdout, "string");
			}
		});

		it("executes without error with --project argument", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			const { stdout, stderr } = await execFile("node", [binPath, "--project", projectPath], {
				cwd: process.cwd(),
			});
			// execFile resolves only if exit code is 0 (success)
			assert.strictEqual(typeof stdout, "string");
			assert.strictEqual(typeof stderr, "string");
		});

		it("executes without error with -p shorthand argument", async () => {
			const projectPath = join("test", "fixtures", "project-with-jsconfig");
			const { stdout, stderr } = await execFile("node", [binPath, "-p", projectPath], {
				cwd: process.cwd(),
			});
			// execFile resolves only if exit code is 0 (success)
			assert.strictEqual(typeof stdout, "string");
			assert.strictEqual(typeof stderr, "string");
		});

		it("executes with --exclude-test argument (may find issues)", async () => {
			try {
				const { stdout, stderr } = await execFile("node", [binPath, "--exclude-test"], {
					cwd: process.cwd(),
				});
				// execFile resolves only if exit code is 0 (success - no issues found)
				assert.strictEqual(typeof stdout, "string");
				assert.strictEqual(typeof stderr, "string");
			} catch (error) {
				// If non-zero exit code, should be exit code 1 (issues found) not 2 (fatal error)
				assert.ok(error instanceof Error);
				assert.ok("code" in error);
				assert.ok(error.code === 1, `Expected exit code 1 but got ${error.code}`);
				assert.ok("stdout" in error);
				assert.strictEqual(typeof error.stdout, "string");
			}
		});

		it("executes with --reporter=summary argument", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			try {
				const { stdout, stderr } = await execFile(
					"node",
					[binPath, "--project", projectPath, "--reporter", "summary"],
					{
						cwd: process.cwd(),
					},
				);
				assert.strictEqual(typeof stdout, "string");
				assert.strictEqual(typeof stderr, "string");
			} catch (error) {
				// If non-zero exit code, should be exit code 1 (issues found) not 2 (fatal error)
				assert.ok(error instanceof Error);
				assert.ok("code" in error);
				assert.ok(error.code === 1, `Expected exit code 1 but got ${error.code}`);
			}
		});

		it("executes with --reporter=raw-json argument", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			try {
				const { stdout, stderr } = await execFile(
					"node",
					[binPath, "--project", projectPath, "--reporter", "raw-json"],
					{
						cwd: process.cwd(),
					},
				);
				assert.strictEqual(typeof stdout, "string");
				assert.strictEqual(typeof stderr, "string");
				// JSON output should be parseable
				JSON.parse(stdout);
			} catch (error) {
				// If non-zero exit code, should be exit code 1 (issues found) not 2 (fatal error)
				assert.ok(error instanceof Error);
				assert.ok("code" in error);
				assert.ok(error.code === 1, `Expected exit code 1 but got ${error.code}`);
				// Should still be valid JSON even with errors
				if ("stdout" in error && typeof error.stdout === "string") {
					JSON.parse(error.stdout);
				}
			}
		});

		it("executes with --output argument and writes to file", async () => {
			const projectPath = join("test", "fixtures", "project-with-type-assertions");
			const outputPath = join("test-out", "bin", "output-cli.txt");

			try {
				const { stdout, stderr } = await execFile(
					"node",
					[binPath, "--project", projectPath, "--output", outputPath],
					{
						cwd: process.cwd(),
					},
				);

				// stdout should be empty when using --output
				assert.strictEqual(stdout, "");
				assert.strictEqual(typeof stderr, "string");

				// Check that output file was created
				const outputContent = await readFile(outputPath, "utf-8");
				assert.ok(outputContent.length > 0);
			} catch (error) {
				// If non-zero exit code, should be exit code 1 (issues found) not 2 (fatal error)
				assert.ok(error instanceof Error);
				assert.ok("code" in error);
				assert.ok(error.code === 1, `Expected exit code 1 but got ${error.code}`);

				// Check that output file was still created
				const outputContent = await readFile(outputPath, "utf-8");
				assert.ok(outputContent.length > 0);
			}
		});

		it("executes with --output and --reporter=raw-json arguments", async () => {
			const projectPath = join("test", "fixtures", "project-with-type-assertions");
			const outputPath = join("test-out", "bin", "output-json-cli.txt");

			try {
				await execFile(
					"node",
					[binPath, "--project", projectPath, "--output", outputPath, "--reporter", "raw-json"],
					{
						cwd: process.cwd(),
					},
				);

				// This should fail due to type assertions, but output file should still be created
				assert.fail("Should have thrown due to type assertions");
			} catch (error) {
				// Should be exit code 1 (issues found)
				assert.ok(error instanceof Error);
				assert.ok("code" in error);
				assert.ok(error.code === 1, `Expected exit code 1 but got ${error.code}`);

				// Check that output file was created with valid JSON
				const outputContent = await readFile(outputPath, "utf-8");
				assert.ok(outputContent.length > 0);
				JSON.parse(outputContent); // Should not throw
			}
		});

		it("creates nested output directories automatically", async () => {
			const projectPath = join("test", "fixtures", "project-with-type-assertions");
			const outputPath = join("test-out", "bin", "nested", "subdir", "output.txt");

			try {
				await execFile("node", [binPath, "--project", projectPath, "--output", outputPath], {
					cwd: process.cwd(),
				});

				// This should fail due to type assertions, but directories and output file should still be created
				assert.fail("Should have thrown due to type assertions");
			} catch (error) {
				// Should be exit code 1 (issues found)
				assert.ok(error instanceof Error);
				assert.ok("code" in error);
				assert.ok(error.code === 1, `Expected exit code 1 but got ${error.code}`);

				// Check that nested directories were created and output file exists
				const outputContent = await readFile(outputPath, "utf-8");
				assert.ok(outputContent.length > 0);
				assert.ok(outputContent.includes("Found suspicious type assertions"));
			}
		});

		it("exits with code 2 for invalid reporter option", async () => {
			try {
				await execFile("node", [binPath, "--reporter", "invalid"], {
					cwd: process.cwd(),
				});
				assert.fail("Expected command to exit with code 2 for invalid reporter");
			} catch (error) {
				assert.ok(error instanceof Error);
				assert.ok("code" in error);
				assert.strictEqual(error.code, 2);
				assert.ok("stderr" in error);
				assert.ok(typeof error.stderr === "string" && error.stderr.includes("Unknown reporter"));
			}
		});
	});

	describe("Exit codes", () => {
		it("exits with code 0 for successful inspection", async () => {
			const projectPath = join("test", "fixtures", "project-with-tsconfig");
			const { stdout, stderr } = await execFile("node", [binPath, "-p", projectPath], {
				cwd: process.cwd(),
			});
			// execFile resolves only if exit code is 0 - this test verifies exit code 0
			assert.strictEqual(typeof stdout, "string");
			assert.strictEqual(typeof stderr, "string");
		});

		it("exits with code 1 for inspection errors (code quality issues)", async () => {
			const projectPath = join("test", "fixtures", "project-with-type-assertions");
			try {
				await execFile("node", [binPath, "--project", projectPath], {
					cwd: process.cwd(),
				});
				assert.fail("Expected command to exit with code 1 for type assertion findings");
			} catch (error) {
				// Should exit with code 1 for inspection errors (code quality issues)
				assert.ok(error instanceof Error);
				assert.ok("code" in error);
				assert.strictEqual(error.code, 1);
				// Should output findings to stdout
				assert.ok("stdout" in error);
				assert.ok(typeof error.stdout === "string");
				assert.ok(error.stdout.includes("Found suspicious type assertions"));
			}
		});

		it("exits with code 2 for non-existent project (fatal error)", async () => {
			const nonExistentPath = join("test", "fixtures", "non-existent-project");
			try {
				await execFile("node", [binPath, "--project", nonExistentPath], {
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
				await execFile("node", [binPath, "--unknown-option"], {
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
				await execFile("node", [binPath, "--project", "src/index.ts"], {
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
