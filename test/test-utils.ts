/**
 * Test utilities for running Node.js scripts and other test helpers.
 */

import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { Writable } from "node:stream";

export interface ExecuteNodeScriptResult {
	code: number;
	stdout: string;
	stderr: string;
}

/**
 * Determines if --experimental-strip-types flag is needed based on Node.js version.
 * Returns true for Node.js < 23.6.0, false for >= 23.6.0 (native TypeScript support).
 */
function needsStripTypesFlag(): boolean {
	const nodeVersion = process.version;
	const versionMatch = nodeVersion.match(/^v(\d+)\.(\d+)\.(\d+)/);

	return (
		versionMatch != null &&
		(parseInt(versionMatch[1], 10) < 23 ||
			(parseInt(versionMatch[1], 10) === 23 && parseInt(versionMatch[2], 10) < 6))
	);
}

/**
 * Adds --experimental-strip-types flag to Node.js arguments if needed based on version.
 */
function addStripTypesIfNeeded(scriptPath: string): string[] {
	return needsStripTypesFlag() ? ["--experimental-strip-types", scriptPath] : [scriptPath];
}

/**
 * Executes a TypeScript file using Node.js with appropriate flags based on version.
 * Uses --experimental-strip-types for Node.js < 23.6.0, native support for >= 23.6.0.
 */
export function executeNodeScript(scriptPath: string): Promise<ExecuteNodeScriptResult> {
	const nodeArgs = addStripTypesIfNeeded(scriptPath);

	return new Promise<ExecuteNodeScriptResult>((resolve) => {
		const child = spawn("node", nodeArgs, {
			stdio: "pipe",
		});

		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (data) => {
			stdout += data.toString();
		});

		child.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		child.on("close", (code) => {
			resolve({ code: code ?? 0, stdout, stderr });
		});
	});
}

/**
 * Prepares a test output directory by removing and recreating it.
 */
export async function prepareTestOutputDirectory(dirPath: string): Promise<void> {
	if (!dirPath.startsWith("test-out/"))
		throw new Error("Test output directory must start with 'test-out/'");

	await rm(dirPath, { recursive: true, force: true });
	await mkdir(dirPath, { recursive: true });
}

/**
 * Mock writable stream that collects written data.
 */
export interface MockWritableStream extends Writable {
	/**
	 * Get all collected output as a string.
	 */
	getOutput(): string;
}

/**
 * Creates a mock writable stream that collects written data as a string.
 */
export function mockWritable(): MockWritableStream {
	const chunks: string[] = [];

	const stream = new Writable({
		write(
			chunk: Buffer | string,
			_encoding: BufferEncoding,
			callback: (error?: Error | null) => void,
		): void {
			chunks.push(chunk.toString());
			callback();
		},
	});

	const mockStream: MockWritableStream = Object.assign(stream, {
		getOutput: (): string => {
			return chunks.join("");
		},
	});

	return mockStream;
}
