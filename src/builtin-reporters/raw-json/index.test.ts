/**
 * Unit tests for raw JSON reporter factory.
 */

import assert from "node:assert";
import { describe, it } from "node:test";
import { mockWritable } from "../../../test/test-utils.ts";
import { createTestSimpleDiagnostics } from "../../diagnostics/index.ts";
import type { InspectorResult } from "../../inspector/index.ts";
import { createRawJsonReporter } from "./index.ts";

describe("builtin-reporters/raw-json/index", () => {
	describe("createRawJsonReporter", () => {
		it("creates functional reporter", () => {
			const reporter = createRawJsonReporter();
			assert.strictEqual(typeof reporter, "function");
		});

		it("creates reporter that outputs valid JSON", () => {
			const reporter = createRawJsonReporter();
			const output = mockWritable();

			const results: InspectorResult[] = [
				{
					inspectorName: "test-inspector",
					diagnostics: createTestSimpleDiagnostics({ message: "Test message" }, []),
				},
			];

			reporter(results, output);

			const outputStr = output.getOutput();
			assert.ok(outputStr.length > 0);

			// Should be valid JSON
			const parsed = JSON.parse(outputStr);
			assert.ok(Array.isArray(parsed));
			assert.strictEqual(parsed.length, 1);
			assert.strictEqual(parsed[0].inspectorName, "test-inspector");
		});

		it("creates reporter that handles empty results", () => {
			const reporter = createRawJsonReporter();
			const output = mockWritable();

			reporter([], output);

			const outputStr = output.getOutput();
			const parsed = JSON.parse(outputStr);
			assert.ok(Array.isArray(parsed));
			assert.strictEqual(parsed.length, 0);
		});
	});
});
