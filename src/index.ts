/**
 * Main entry point for the ts-inspect library providing TypeScript AST inspection utilities.
 */

import { createDefaultInspectors } from "./builtin-inspectors/index.ts";
import { type TsInspectError, wrapUnexpectedExceptionsAsync } from "./error.ts";
import { type InspectionStatus, type Inspector, runInspectors } from "./inspector/index.ts";
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
	// biome-ignore lint/suspicious/noExplicitAny: We can't use the unknown type here because this should accept inspectors with variadic types.
	inspectors?: Inspector<any>[];
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

/** @see inspectFiles */
async function inspectFilesInternal(
	filePaths: string[],
	options?: InspectOptions,
): Promise<InspectionStatus> {
	return executeInspection(filePaths, options?.sourceFilesOptions, options?.inspectors);
}

/** @see inspectProject */
async function inspectProjectInternal(
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

/**
 * Inspects the specified files.
 *
 * @throws {TsInspectError} for fatal runtime errors.
 */
export const inspectFiles = wrapUnexpectedExceptionsAsync(inspectFilesInternal);

/**
 * Inspects files based on TypeScript project configuration.
 * Accepts either a directory path or tsconfig.json file path.
 *
 * Auto-detects tsconfig.json in current directory if not specified.
 *
 * @throws {TsInspectError} for fatal runtime errors.
 */
export const inspectProject = wrapUnexpectedExceptionsAsync(inspectProjectInternal);

export { createAsAssertionInspector } from "./builtin-inspectors/index.ts";
export type {
	FileInspectionResult,
	InspectionStatus,
	Inspector,
	NodeInspector,
	ResultsHandler,
} from "./inspector/index.ts";
export { translateStatusToExitCode } from "./inspector/index.ts";
export type { TsInspectError };
