import type ts from "typescript";
import { fileExists } from "./core/files.ts";
import { parseConfig } from "./core/ts/config.ts";
import { type Inspector, runInspectors } from "./inspector/index.ts";
import { createDefaultInspectors } from "./preset-inspectors/index.ts";
import {
	inferParseSourceFilesOptions,
	type ParseSourceFilesOptions,
	parseSourceFiles,
} from "./source-file/index.ts";

export interface InspectOptions {
	sourceFilesOptions?: ParseSourceFilesOptions;
	inspectors?: Inspector[];
}

function executeInspection(
	filePaths: string[],
	sourceFilesOptions?: ParseSourceFilesOptions,
	inspectors?: Inspector[],
) {
	const resolvedInspectors = inspectors ?? createDefaultInspectors();
	const srcFilePromises = parseSourceFiles(filePaths, sourceFilesOptions);
	runInspectors(resolvedInspectors, srcFilePromises);
}

export async function inspectFiles(filePaths: string[], options?: InspectOptions) {
	executeInspection(filePaths, options?.sourceFilesOptions, options?.inspectors);
}

export async function inspectWithTsconfig(tsconfigPath?: string, options?: InspectOptions) {
	let tsconfig: ts.ParsedCommandLine;
	if (tsconfigPath) {
		tsconfig = parseConfig(tsconfigPath);
	} else if (await fileExists("tsconfig.json")) {
		tsconfig = parseConfig("tsconfig.json");
	} else {
		throw new Error("No tsconfig.json found in the current directory.");
	}

	executeInspection(
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
