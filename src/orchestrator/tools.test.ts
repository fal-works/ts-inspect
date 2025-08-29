/**
 * Unit tests for orchestrator tools module.
 */

import assert from "node:assert";
import { describe, it } from "node:test";
import { translateSeverityToExitCode } from "./tools.ts";

describe("orchestrator/tools", () => {
	describe("translateSeverityToExitCode", () => {
		it("returns 1 for error severity", () => {
			assert.strictEqual(translateSeverityToExitCode("error"), 1);
		});

		it("returns 0 for warning severity", () => {
			assert.strictEqual(translateSeverityToExitCode("warning"), 0);
		});

		it("returns 0 for info severity", () => {
			assert.strictEqual(translateSeverityToExitCode("info"), 0);
		});

		it("returns 0 for null severity (no issues)", () => {
			assert.strictEqual(translateSeverityToExitCode(null), 0);
		});
	});
});
