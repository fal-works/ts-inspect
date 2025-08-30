/**
 * Source file parsing functionality.
 */

import { readFile } from "node:fs/promises";
import ts from "typescript";
import type { ParsedSourceFile } from "../../../inspector/source-file-types.ts";
import { createFileTypeValidator, getFileTypeFromExtension, getScriptKind } from "./file-type.ts";
import { inferParseSourceFilesOptions, type ParseSourceFilesOptions } from "./options.ts";

const testFileNameDefaultRegex = /\.test\.(ts|tsx|js|jsx)$/;

/**
 * Parses multiple source files and returns TypeScript AST with metadata for each file.
 */
export function parseSourceFiles(
	filePaths: readonly string[],
	options: ParseSourceFilesOptions = {},
): Promise<ParsedSourceFile>[] {
	const testFileNameRegex = options.testFileNameRegex ?? testFileNameDefaultRegex;
	const includesFileType = createFileTypeValidator(options.fileTypes);
	const languageVersionOrOptions = options.languageVersionOrOptions ?? ts.ScriptTarget.Latest;

	const promises: Promise<ParsedSourceFile>[] = [];

	for (const filePath of filePaths) {
		const fileType = getFileTypeFromExtension(filePath);
		if (fileType === null || !includesFileType(fileType)) continue;
		const isTest = testFileNameRegex.test(filePath);
		if (options.excludeTest && isTest) continue;

		const promise = readFile(filePath, "utf-8").then((code) => {
			const file = ts.createSourceFile(
				filePath,
				code,
				languageVersionOrOptions,
				true,
				getScriptKind(fileType),
			);

			const parsed: ParsedSourceFile = {
				file,
				metadata: {
					fileType,
					isDeclaration: file.isDeclarationFile,
					isTest,
				},
			};

			return parsed;
		});

		promises.push(promise);
	}

	return promises;
}

/**
 * Parses source files from a TypeScript configuration.
 */
export function parseSourceFilesFromConfig(
	config: ts.ParsedCommandLine,
	options?: ParseSourceFilesOptions,
): Promise<ParsedSourceFile>[] {
	return parseSourceFiles(config.fileNames, inferParseSourceFilesOptions(config, options));
}
