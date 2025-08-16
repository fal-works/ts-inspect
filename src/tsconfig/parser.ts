/**
 * Parses a TypeScript configuration file.
 */

import { dirname } from "node:path";
import ts from "typescript";
import { TsInspectError } from "../error.ts";

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
		throw new TsInspectError({
			errorCode: "config-file-read-failure",
			diagnostics: [configFile.error],
		});
	}

	const configParseResult = ts.parseJsonConfigFileContent(
		configFile.config,
		ts.sys,
		dirname(tsconfigPath),
	);
	if (configParseResult.errors.length) {
		throw new TsInspectError({
			errorCode: "config-parse-failure",
			diagnostics: configParseResult.errors,
		});
	}

	if (allowJs) {
		configParseResult.options.allowJs = true;
	}

	return configParseResult;
}
