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
 */
export async function resolveProjectPath(projectPath: string): Promise<string> {
	if (projectPath.endsWith(".json")) {
		return projectPath;
	}

	const absolutePath = resolve(projectPath);

	if (!(await isDirectory(projectPath))) {
		throw new Error(`Path is not a directory: ${absolutePath}`);
	}

	// Look for config files in the directory
	const tsconfigPath = join(projectPath, "tsconfig.json");
	if (await fileExists(tsconfigPath)) {
		return tsconfigPath;
	}
	const jsconfigPath = join(projectPath, "jsconfig.json");
	if (await fileExists(jsconfigPath)) {
		return jsconfigPath;
	}

	throw new Error(`No tsconfig.json or jsconfig.json found in directory: ${absolutePath}`);
}
