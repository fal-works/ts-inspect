import { access, mkdir, stat } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * @returns Resolves `true` if the file exists, `false` otherwise.
 */
export async function fileExists(filePath: string): Promise<boolean> {
	return access(filePath)
		.then(() => true)
		.catch(() => false);
}

/**
 * @returns Resolves `true` if the path is a directory, `false` otherwise.
 */
export async function isDirectory(path: string): Promise<boolean> {
	return stat(path)
		.then((stats) => stats.isDirectory())
		.catch(() => false);
}

/**
 * Ensures the parent directory of a file path exists.
 */
export async function ensureDirectoryExists(filePath: string): Promise<void> {
	const outputDir = dirname(filePath);
	await mkdir(outputDir, { recursive: true });
}
