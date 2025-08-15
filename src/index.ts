/**
 * Main entry point for the ts-inspect library providing TypeScript AST inspection utilities.
 */

import { type InspectionStatus, type Inspector, runInspectors } from "./inspector/index.ts";
import { createDefaultInspectors } from "./preset-inspectors/index.ts";
import {
	inferParseSourceFilesOptions,
	type ParseSourceFilesOptions,
	parseSourceFiles,
} from "./source-file/index.ts";
import { parseConfig, resolveProjectPath } from "./tsconfig/index.ts";

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
 * Inspects files based on TypeScript project configuration.
 * Accepts either a directory path or tsconfig.json file path.
 *
 * Auto-detects tsconfig.json in current directory if not specified.
 */
export async function inspectProject(
	projectPath?: string,
	options?: InspectOptions,
): Promise<InspectionStatus> {
	const tsconfigPath = await resolveProjectPath(projectPath);
	const tsconfig = parseConfig(tsconfigPath, tsconfigPath.endsWith("jsconfig.json"));

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
