/**
 * Main entry point for the ts-inspect library providing TypeScript AST inspection utilities.
 */

import type ts from "typescript";
import { fileExists } from "./core/files.ts";
import { parseConfig } from "./core/ts/config.ts";
import { type InspectionStatus, type Inspector, runInspectors } from "./inspector/index.ts";
import { createDefaultInspectors } from "./preset-inspectors/index.ts";
import {
	inferParseSourceFilesOptions,
	type ParseSourceFilesOptions,
	parseSourceFiles,
} from "./source-file/index.ts";

/**
 * Configuration options for inspection operations.
 */
export interface InspectOptions {
	sourceFilesOptions?: ParseSourceFilesOptions;
	inspectors?: Inspector[];
}

/**
 * Executes inspection on the provided file paths with the given options and/or inspectors.
 */
function executeInspection(
	filePaths: string[],
	sourceFilesOptions: ParseSourceFilesOptions | undefined,
	inspectors: Inspector[] | undefined,
): Promise<InspectionStatus> {
	const resolvedInspectors = inspectors ?? createDefaultInspectors();
	const srcFilePromises = parseSourceFiles(filePaths, sourceFilesOptions);

	return runInspectors(resolvedInspectors, srcFilePromises);
}

/**
 * Inspects the specified files.
 */
export async function inspectFiles(
	filePaths: string[],
	options?: InspectOptions,
): Promise<InspectionStatus> {
	return executeInspection(filePaths, options?.sourceFilesOptions, options?.inspectors);
}

/**
 * Inspects files based on TypeScript configuration, auto-detecting tsconfig.json if not specified.
 */
export async function inspectWithTsconfig(
	tsconfigPath?: string,
	options?: InspectOptions,
): Promise<InspectionStatus> {
	let tsconfig: ts.ParsedCommandLine;
	if (tsconfigPath) {
		tsconfig = parseConfig(tsconfigPath);
	} else if (await fileExists("tsconfig.json")) {
		tsconfig = parseConfig("tsconfig.json");
	} else {
		throw new Error("No tsconfig.json found in the current directory.");
	}

	return executeInspection(
		tsconfig.fileNames,
		inferParseSourceFilesOptions(tsconfig, options?.sourceFilesOptions),
		options?.inspectors,
	);
}

export type {
	FileInspectionResult,
	InspectionStatus,
	Inspector,
	NodeInspector,
	ResultsHandler,
} from "./inspector/index.ts";

export { createAsAssertionInspector } from "./preset-inspectors/index.ts";
