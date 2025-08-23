/**
 * Main entry point for the ts-inspect library providing TypeScript AST inspection utilities.
 */

import type { Writable } from "node:stream";
import { createDefaultInspectors } from "./builtin-inspectors/index.ts";
import { type DiagnosticSeverity, getOverallWorstSeverity } from "./diagnostics/index.ts";
import { type TsInspectError, wrapUnexpectedExceptionsAsync } from "./error.ts";
import { type Inspector, runInspectors } from "./inspector/index.ts";
import { type Reporter, summaryReporter } from "./reporter/index.ts";
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
	/** Reporter function for formatting output (defaults to summaryReporter) */
	reporter?: Reporter;
	/** Output stream for writing results (defaults to process.stdout) */
	output?: Writable;
}

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
	const resolvedReporter = options?.reporter ?? summaryReporter;
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
	const tsconfigPath = await resolveProjectPath(projectPath);
	const tsconfig = parseConfig(tsconfigPath, tsconfigPath.endsWith("jsconfig.json"));

	// Create new options with computed sourceFilesOptions based on tsconfig
	const projectOptions: InspectOptions = {
		...options,
		sourceFilesOptions: inferParseSourceFilesOptions(tsconfig, options?.sourceFilesOptions),
	};

	return executeInspection(tsconfig.fileNames, projectOptions);
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
export { createPrinter, type Printer, type PrinterOptions } from "./core/printer.ts";
export { createXmlPrinter, type XmlPrinter } from "./core/xml-printer.ts";
export type {
	CodeLocation,
	DetailedFinding,
	DiagnosticDetails,
	DiagnosticSeverity,
	Diagnostics,
	Finding,
	RichDiagnostics,
	RichDiagnosticsFileScope,
	SimpleDiagnostics,
	SimpleDiagnosticsFileScope,
} from "./diagnostics/index.ts";
export { translateSeverityToExitCode } from "./diagnostics/index.ts";
export type {
	FileInspectionResult,
	Inspector,
	InspectorResult,
	InspectorResults,
	NodeInspector,
	ResultsBuilder,
} from "./inspector/index.ts";
export { type Reporter, rawJsonReporter, summaryReporter } from "./reporter/index.ts";
export type { TsInspectError };
