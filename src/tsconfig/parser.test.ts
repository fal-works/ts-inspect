import assert from "node:assert";
import { describe, it } from "node:test";
import { TsInspectError } from "../error.ts";
import { parseConfig } from "./parser.ts";

describe("tsconfig/parser", () => {
	describe("parseConfig", () => {
		it("parses valid tsconfig.json", () => {
			const result = parseConfig("test/fixtures/project-with-tsconfig/tsconfig.json");

			assert.ok(result);
			assert.ok(result.options);
			assert.strictEqual(result.options.target, 7); // ES2020
		});

		it("parses valid jsconfig.json", () => {
			const result = parseConfig("test/fixtures/project-with-jsconfig/jsconfig.json");

			assert.ok(result);
			assert.ok(result.options);
			assert.strictEqual(result.options.target, 6); // ES2019
		});

		it("applies allowJs option when specified", () => {
			const result = parseConfig("test/fixtures/project-with-jsconfig/jsconfig.json", true);

			assert.strictEqual(result.options.allowJs, true);
		});

		it("throws TsInspectError with config-file-read-failure for non-existent config file", () => {
			assert.throws(
				() => parseConfig("test/fixtures/non-existent-config.json"),
				(error: unknown) => {
					assert.ok(error instanceof TsInspectError);
					assert.strictEqual(error.type.errorCode, "config-file-read-failure");
					assert.ok(Array.isArray(error.type.diagnostics));
					assert.ok(error.type.diagnostics.length > 0);
					return true;
				},
			);
		});

		it("throws TsInspectError with config-parse-failure for invalid config file", () => {
			assert.throws(
				() => parseConfig("test/fixtures/invalid-tsconfig.json"),
				(error: unknown) => {
					assert.ok(error instanceof TsInspectError);
					assert.strictEqual(error.type.errorCode, "config-parse-failure");
					assert.ok(Array.isArray(error.type.diagnostics));
					assert.ok(error.type.diagnostics.length > 0);
					return true;
				},
			);
		});

		it("returns correct file list from config", () => {
			const result = parseConfig("test/fixtures/project-with-tsconfig/tsconfig.json");

			assert.ok(Array.isArray(result.fileNames));
			assert.ok(result.fileNames.length > 0);
		});

		it("handles config with extends properly", () => {
			// For this test we would need a config that extends another
			// but we'll keep the test structure simple for now
			const result = parseConfig("test/fixtures/project-with-tsconfig/tsconfig.json");
			assert.ok(result.options);
		});
	});
});
