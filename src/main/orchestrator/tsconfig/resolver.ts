/**
 * Resolves TypeScript project paths to tsconfig or jsconfig files.
 */

import { join, resolve } from "node:path";
import { TsInspectError } from "../../../error/index.ts";
import { fileExists, isDirectory } from "../../../internal/utils/file-system.ts";

/**
 * Resolves a project path. Accepts either:
 * - A direct path to any tsconfig file
 * - A directory path containing either `tsconfig.json` or `jsconfig.json` file
 *
 * @param projectPath - The path to resolve. If not provided, defaults to the current directory.
 * @returns The resolved path to the tsconfig or jsconfig file.
 */
export async function resolveProjectPath(projectPath?: string): Promise<string> {
	const path = projectPath || ".";

	if (path.endsWith(".json")) {
		return path;
	}

	const absolutePath = resolve(path);

	if (!(await isDirectory(path))) {
		throw new TsInspectError({
			errorCode: "invalid-project-path",
			path: absolutePath,
		});
	}

	// Look for config files in the directory
	const tsconfigPath = join(path, "tsconfig.json");
	if (await fileExists(tsconfigPath)) {
		return tsconfigPath;
	}
	const jsconfigPath = join(path, "jsconfig.json");
	if (await fileExists(jsconfigPath)) {
		return jsconfigPath;
	}

	throw new TsInspectError({
		errorCode: "config-file-not-found",
		directoryPath: absolutePath,
	});
}
