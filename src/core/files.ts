import { access } from "node:fs/promises";

/**
 * @returns Resolves `true` if the file exists, `false` otherwise.
 */
export async function fileExists(filePath: string): Promise<boolean> {
	return access(filePath)
		.then(() => true)
		.catch(() => false);
}
