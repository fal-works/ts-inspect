import ts from "typescript";
import type { FileType } from "./file-type.ts";

export interface ParseSourceFilesOptions {
	fileTypes?: FileType[];
	excludeTest?: boolean;
	testFileNameRegex?: RegExp;
	languageVersionOrOptions?: Parameters<typeof ts.createSourceFile>[2];
}

function inferFileTypes(config: ts.ParsedCommandLine): FileType[] {
	const fileTypes: FileType[] = ["ts", "tsx"];

	const { options } = config;
	if (options.allowJs) fileTypes.push("js", "jsx");
	if (options.resolveJsonModule) fileTypes.push("json");

	return fileTypes;
}

/**
 * Creates options for `ts.createSourceFile` based on the given config.
 *
 * NOTE: TypeScript itself has a function `getCreateSourceFileOptions()` but it is not exposed for external use.
 * This function `inferCreateSourceFileOptions()` should replicate the behavior but actually this is quite incomplete.
 */
function inferCreateSourceFileOptions(config: ts.ParsedCommandLine): ts.CreateSourceFileOptions {
	const { target, moduleResolution } = config.options;

	let impliedNodeFormat: ts.ResolutionMode | undefined;
	switch (moduleResolution) {
		case ts.ModuleResolutionKind.NodeNext:
			impliedNodeFormat = ts.ModuleKind.CommonJS;
			break;
		case ts.ModuleResolutionKind.Node16:
			impliedNodeFormat = ts.ModuleKind.CommonJS;
			break;
	}

	return {
		languageVersion: target ?? ts.ScriptTarget.Latest,
		impliedNodeFormat,
	};
}

export function inferParseSourceFilesOptions(
	config: ts.ParsedCommandLine,
	userOptions?: ParseSourceFilesOptions,
): ParseSourceFilesOptions {
	let opt = userOptions;
	if (!opt) {
		opt = {};
	} else if (!opt.fileTypes || !opt.languageVersionOrOptions) {
		opt = Object.assign({}, opt);
	}
	if (!opt.fileTypes) {
		opt.fileTypes = inferFileTypes(config);
	}
	if (!opt.languageVersionOrOptions) {
		opt.languageVersionOrOptions = inferCreateSourceFileOptions(config);
	}

	return opt;
}
