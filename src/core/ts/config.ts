/**
 * TypeScript configuration file parsing utilities.
 */

import { dirname } from "node:path";
import ts from "typescript";
import { formatDiagnostics } from "./diagnostics.ts";

/**
 * Parses a TypeScript configuration file.
 *
 * @throws Error if reading or parsing the config file fails.
 */
export function parseConfig(tsconfigPath: string): ts.ParsedCommandLine {
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

	return configParseResult;
}
