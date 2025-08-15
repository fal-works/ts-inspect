import assert from "node:assert";
import { describe, it } from "node:test";
import ts from "typescript";
import { inferParseSourceFilesOptions, type ParseSourceFilesOptions } from "./parser-options.ts";

describe("parser-options", () => {
	describe("inferParseSourceFilesOptions", () => {
		it("infers file types from TypeScript config with allowJs", () => {
			const mockConfig: ts.ParsedCommandLine = {
				options: {
					allowJs: true,
					resolveJsonModule: true,
				},
				fileNames: [],
				errors: [],
			};

			const result = inferParseSourceFilesOptions(mockConfig);

			assert.ok(result.fileTypes);
			assert.ok(result.fileTypes.includes("ts"));
			assert.ok(result.fileTypes.includes("tsx"));
			assert.ok(result.fileTypes.includes("js"));
			assert.ok(result.fileTypes.includes("jsx"));
			assert.ok(result.fileTypes.includes("json"));
		});

		it("infers file types from TypeScript config without allowJs", () => {
			const mockConfig: ts.ParsedCommandLine = {
				options: {
					allowJs: false,
				},
				fileNames: [],
				errors: [],
			};

			const result = inferParseSourceFilesOptions(mockConfig);

			assert.ok(result.fileTypes);
			assert.ok(result.fileTypes.includes("ts"));
			assert.ok(result.fileTypes.includes("tsx"));
			assert.ok(!result.fileTypes.includes("js"));
			assert.ok(!result.fileTypes.includes("jsx"));
			assert.ok(!result.fileTypes.includes("json"));
		});

		it("preserves user-provided file types", () => {
			const mockConfig: ts.ParsedCommandLine = {
				options: { allowJs: true },
				fileNames: [],
				errors: [],
			};

			const userOptions: ParseSourceFilesOptions = {
				fileTypes: ["ts"],
			};

			const result = inferParseSourceFilesOptions(mockConfig, userOptions);

			assert.deepStrictEqual(result.fileTypes, ["ts"]);
		});

		it("infers language version from target", () => {
			const mockConfig: ts.ParsedCommandLine = {
				options: {
					target: ts.ScriptTarget.ES2020,
				},
				fileNames: [],
				errors: [],
			};

			const result = inferParseSourceFilesOptions(mockConfig);

			assert.ok(result.languageVersionOrOptions);
			if (typeof result.languageVersionOrOptions === "object") {
				assert.strictEqual(result.languageVersionOrOptions.languageVersion, ts.ScriptTarget.ES2020);
			}
		});

		it("handles NodeNext module resolution", () => {
			const mockConfig: ts.ParsedCommandLine = {
				options: {
					moduleResolution: ts.ModuleResolutionKind.NodeNext,
					target: ts.ScriptTarget.ES2022,
				},
				fileNames: [],
				errors: [],
			};

			const result = inferParseSourceFilesOptions(mockConfig);

			assert.ok(result.languageVersionOrOptions);
			if (typeof result.languageVersionOrOptions === "object") {
				assert.strictEqual(
					result.languageVersionOrOptions.impliedNodeFormat,
					ts.ModuleKind.CommonJS,
				);
			}
		});

		it("handles Node16 module resolution", () => {
			const mockConfig: ts.ParsedCommandLine = {
				options: {
					moduleResolution: ts.ModuleResolutionKind.Node16,
					target: ts.ScriptTarget.ES2021,
				},
				fileNames: [],
				errors: [],
			};

			const result = inferParseSourceFilesOptions(mockConfig);

			assert.ok(result.languageVersionOrOptions);
			if (typeof result.languageVersionOrOptions === "object") {
				assert.strictEqual(
					result.languageVersionOrOptions.impliedNodeFormat,
					ts.ModuleKind.CommonJS,
				);
			}
		});

		it("preserves user-provided language version options", () => {
			const mockConfig: ts.ParsedCommandLine = {
				options: { target: ts.ScriptTarget.ES2020 },
				fileNames: [],
				errors: [],
			};

			const userOptions: ParseSourceFilesOptions = {
				languageVersionOrOptions: ts.ScriptTarget.ES5,
			};

			const result = inferParseSourceFilesOptions(mockConfig, userOptions);

			assert.strictEqual(result.languageVersionOrOptions, ts.ScriptTarget.ES5);
		});

		it("handles config without options", () => {
			const mockConfig: ts.ParsedCommandLine = {
				options: {},
				fileNames: [],
				errors: [],
			};

			const result = inferParseSourceFilesOptions(mockConfig);

			assert.ok(result.fileTypes);
			assert.ok(result.languageVersionOrOptions);
		});

		it("preserves other user options unchanged", () => {
			const mockConfig: ts.ParsedCommandLine = {
				options: {},
				fileNames: [],
				errors: [],
			};

			const userOptions: ParseSourceFilesOptions = {
				excludeTest: true,
				testFileNameRegex: /\.test\./,
			};

			const result = inferParseSourceFilesOptions(mockConfig, userOptions);

			assert.strictEqual(result.excludeTest, true);
			assert.strictEqual(result.testFileNameRegex, userOptions.testFileNameRegex);
		});
	});
});
