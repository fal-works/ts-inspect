/**
 * Configuration options for inspection operations.
 */

import type { Writable } from "node:stream";
import type { Inspector } from "../../inspector/index.ts";
import type { Reporter } from "../../reporter/index.ts";
import {
	inferParseSourceFilesOptions,
	type ParseSourceFilesOptions,
} from "../../source-file/index.ts";
import { parseConfig, resolveProjectPath } from "./tsconfig/index.ts";

/**
 * Configuration options for inspection operations.
 */
export interface InspectOptions {
	sourceFilesOptions?: ParseSourceFilesOptions;
	// biome-ignore lint/suspicious/noExplicitAny: We can't use the unknown type here because this should accept inspectors with variadic types.
	inspectors?: Inspector<any>[];
	/** Reporter function for formatting output (defaults to summaryReporter) */
	reporter?: Reporter;
	/** Output stream for writing results (defaults to process.stdout) */
	output?: Writable;
}

/**
 * Infers inspection options from a TypeScript project configuration.
 *
 * @param projectPath - Path to project directory or tsconfig.json file
 * @param baseOptions - Base options to merge with inferred options
 * @returns Promise that resolves to merged options with inferred sourceFilesOptions
 */
export async function inferOptionsFromProject(
	projectPath?: string,
	baseOptions?: InspectOptions,
): Promise<{ options: InspectOptions; fileNames: string[] }> {
	const tsconfigPath = await resolveProjectPath(projectPath);
	const tsconfig = parseConfig(tsconfigPath, tsconfigPath.endsWith("jsconfig.json"));

	// Create new options with computed sourceFilesOptions based on tsconfig
	const options: InspectOptions = {
		...baseOptions,
		sourceFilesOptions: inferParseSourceFilesOptions(tsconfig, baseOptions?.sourceFilesOptions),
	};

	return { options, fileNames: tsconfig.fileNames };
}
