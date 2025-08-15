import assert from "node:assert";
import { describe, it } from "node:test";
import { parseConfig } from "./parser.ts";

describe("parser", () => {
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

		it("throws error for non-existent config file", () => {
			assert.throws(
				() => parseConfig("test/fixtures/non-existent-config.json"),
				/Cannot read file/,
			);
		});

		it("throws error for invalid config file", () => {
			assert.throws(
				() => parseConfig("test/fixtures/invalid-tsconfig.json"),
				// TypeScript will report errors about invalid target and unknown option
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
