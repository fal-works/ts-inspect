/**
 * Unit tests for inspection status utilities.
 */

import assert from "node:assert";
import { describe, it } from "node:test";
import { translateStatusToExitCode } from "./status.ts";

describe("status", () => {
	describe("translateStatusToExitCode", () => {
		it("returns 0 for success status", () => {
			const result = translateStatusToExitCode("success");
			assert.strictEqual(result, 0);
		});

		it("returns 0 for warn status", () => {
			const result = translateStatusToExitCode("warn");
			assert.strictEqual(result, 0);
		});

		it("returns 1 for error status", () => {
			const result = translateStatusToExitCode("error");
			assert.strictEqual(result, 1);
		});
	});
});
