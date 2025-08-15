/**
 * TypeScript configuration file parsing utilities.
 */

import { dirname, join, resolve } from "node:path";
import ts from "typescript";
import { fileExists, isDirectory } from "../files.ts";
import { formatDiagnostics } from "./diagnostics.ts";

/**
 * Parses a TypeScript configuration file.
 *
 * @param tsconfigPath - Path to the TypeScript configuration file.
 * @param allowJs - Set to true for parsing `jsconfig.json` files.
 * @throws Error if reading or parsing the config file fails.
 */
export function parseConfig(tsconfigPath: string, allowJs?: boolean): ts.ParsedCommandLine {
	const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
	if (configFile.error) {
		throw new Error(formatDiagnostics([configFile.error]));
	}

	const configParseResult = ts.parseJsonConfigFileContent(
		configFile.config,
		ts.sys,
		dirname(tsconfigPath),
	);
	if (configParseResult.errors.length) {
		throw new Error(formatDiagnostics(configParseResult.errors));
	}

	if (allowJs) {
		configParseResult.options.allowJs = true;
	}

	return configParseResult;
}

/**
 * Resolves a project path to a JSON config file path. Accepts either:
 * - A direct path to any tsconfig file
 * - A directory path containing either `tsconfig.json` or `jsconfig.json` file
 *
 * @params projectPath - The path to resolve. If not provided, defaults to the current directory.
 */
export async function resolveProjectPath(projectPath?: string): Promise<string> {
	const path = projectPath || ".";

	if (path.endsWith(".json")) {
		return path;
	}

	const absolutePath = resolve(path);

	if (!(await isDirectory(path))) {
		throw new Error(
			`The specified project path is neither a JSON file nor a directory: ${absolutePath}`,
		);
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

	throw new Error(`No tsconfig.json or jsconfig.json found in directory: ${absolutePath}`);
}
