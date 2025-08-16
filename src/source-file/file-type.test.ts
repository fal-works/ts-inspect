import assert from "node:assert";
import { describe, it } from "node:test";
import ts from "typescript";
import {
	createFileTypeValidator,
	type FileType,
	getFileTypeFromExtension,
	getScriptKind,
} from "./file-type.ts";

describe("file-type", () => {
	describe("getFileTypeFromExtension", () => {
		it("returns correct types for TypeScript extensions", () => {
			assert.strictEqual(getFileTypeFromExtension("file.ts"), "ts");
			assert.strictEqual(getFileTypeFromExtension("file.mts"), "ts");
			assert.strictEqual(getFileTypeFromExtension("file.cts"), "ts");
			assert.strictEqual(getFileTypeFromExtension("file.tsx"), "tsx");
		});

		it("returns correct types for JavaScript extensions", () => {
			assert.strictEqual(getFileTypeFromExtension("file.js"), "js");
			assert.strictEqual(getFileTypeFromExtension("file.mjs"), "js");
			assert.strictEqual(getFileTypeFromExtension("file.cjs"), "js");
			assert.strictEqual(getFileTypeFromExtension("file.jsx"), "jsx");
		});

		it("returns json for .json files", () => {
			assert.strictEqual(getFileTypeFromExtension("file.json"), "json");
		});

		it("returns null for unsupported extensions", () => {
			assert.strictEqual(getFileTypeFromExtension("file.txt"), null);
			assert.strictEqual(getFileTypeFromExtension("file.py"), null);
			assert.strictEqual(getFileTypeFromExtension("file"), null);
		});

		it("handles full file paths", () => {
			assert.strictEqual(getFileTypeFromExtension("/path/to/file.ts"), "ts");
			assert.strictEqual(getFileTypeFromExtension("../relative/path.tsx"), "tsx");
		});
	});

	describe("getScriptKind", () => {
		it("maps TypeScript file types correctly", () => {
			assert.strictEqual(getScriptKind("ts"), ts.ScriptKind.TS);
			assert.strictEqual(getScriptKind("tsx"), ts.ScriptKind.TSX);
		});

		it("maps JavaScript file types correctly", () => {
			assert.strictEqual(getScriptKind("js"), ts.ScriptKind.JS);
			assert.strictEqual(getScriptKind("jsx"), ts.ScriptKind.JSX);
		});

		it("maps JSON file type correctly", () => {
			assert.strictEqual(getScriptKind("json"), ts.ScriptKind.JSON);
		});
	});

	describe("createFileTypeValidator", () => {
		it("returns a function that accepts all types when fileTypes is undefined", () => {
			const validator = createFileTypeValidator(undefined);

			assert.strictEqual(validator("ts"), true);
			assert.strictEqual(validator("tsx"), true);
			assert.strictEqual(validator("js"), true);
			assert.strictEqual(validator("jsx"), true);
			assert.strictEqual(validator("json"), true);
		});

		it("returns a function that validates against specific types", () => {
			const validator = createFileTypeValidator(["ts", "tsx"] as const);

			assert.strictEqual(validator("ts"), true);
			assert.strictEqual(validator("tsx"), true);
			assert.strictEqual(validator("js"), false);
			assert.strictEqual(validator("jsx"), false);
			assert.strictEqual(validator("json"), false);
		});

		it("handles single file type", () => {
			const validator = createFileTypeValidator(["json"] as const);

			assert.strictEqual(validator("json"), true);
			assert.strictEqual(validator("ts"), false);
		});

		it("handles empty array", () => {
			const validator = createFileTypeValidator([] as const);

			assert.strictEqual(validator("ts"), false);
			assert.strictEqual(validator("js"), false);
		});

		it("provides correct type narrowing", () => {
			const validator = createFileTypeValidator(["ts", "tsx"] as const);
			const fileType: FileType = "ts";

			if (validator(fileType)) {
				// TypeScript should narrow fileType to "ts" | "tsx"
				const narrowed: "ts" | "tsx" = fileType;
				assert.strictEqual(narrowed, "ts");
			}
		});
	});
});
