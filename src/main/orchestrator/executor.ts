/**
 * Orchestrator executor for inspection operations.
 */

import { type DiagnosticSeverity, getOverallWorstSeverity } from "../../diagnostics/index.ts";
import { wrapUnexpectedExceptionsAsync } from "../../error.ts";
import { runInspectors } from "../../inspector/index.ts";
import { parseSourceFiles } from "../../source-file/index.ts";
import { createDefaultInspectors } from "../builtin-inspectors/index.ts";
import { createSummaryReporter } from "../builtin-reporters/index.ts";
import { type InspectOptions, inferOptionsFromProject } from "./options.ts";

/**
 * Executes inspection on the provided file paths with the given options.
 */
async function executeInspection(
	filePaths: string[],
	options?: InspectOptions,
): Promise<DiagnosticSeverity | null> {
	const resolvedInspectors = options?.inspectors ?? createDefaultInspectors();
	const srcFilePromises = parseSourceFiles(filePaths, options?.sourceFilesOptions);

	const results = await runInspectors(resolvedInspectors, srcFilePromises);

	// Format and output results using the configured reporter
	const resolvedReporter = options?.reporter ?? createSummaryReporter();
	const resolvedOutput = options?.output ?? process.stdout;
	resolvedReporter(results, resolvedOutput);

	// Return the overall severity directly
	return getOverallWorstSeverity(results);
}

/** @see inspectFiles */
async function inspectFilesInternal(
	filePaths: string[],
	options?: InspectOptions,
): Promise<DiagnosticSeverity | null> {
	return executeInspection(filePaths, options);
}

/** @see inspectProject */
async function inspectProjectInternal(
	projectPath?: string,
	options?: InspectOptions,
): Promise<DiagnosticSeverity | null> {
	const { options: projectOptions, fileNames } = await inferOptionsFromProject(
		projectPath,
		options,
	);
	return executeInspection(fileNames, projectOptions);
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
