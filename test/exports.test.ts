/**
 * Tests for package.json exports field - verifies all entry points can be imported correctly.
 */

import assert from "node:assert";
import { describe, test } from "node:test";

// Static imports for all entry points
import * as mainModule from "@fal-works/ts-inspect";
import * as diagnosticsModule from "@fal-works/ts-inspect/diagnostics";
import * as markupModule from "@fal-works/ts-inspect/diagnostics/markup";
import * as inspectorModule from "@fal-works/ts-inspect/inspector";
import * as reporterModule from "@fal-works/ts-inspect/reporter";

describe("test/exports", () => {
	test("main entry point imports", () => {
		// Check orchestrator functions
		assert.strictEqual(typeof mainModule.inspectProject, "function");
		assert.strictEqual(typeof mainModule.inspectFiles, "function");

		// Check builtin inspector
		assert.strictEqual(typeof mainModule.createNoTypeAssertionsInspector, "function");

		// Check builtin reporters
		assert.strictEqual(typeof mainModule.createSummaryReporter, "function");
		assert.strictEqual(typeof mainModule.createRawJsonReporter, "function");

		// Check utility functions
		assert.strictEqual(typeof mainModule.translateSeverityToExitCode, "function");
	});

	test("diagnostics entry point imports", () => {
		// Check key diagnostic types and functions exist
		assert.strictEqual(typeof diagnosticsModule.getOverallWorstSeverity, "function");
		assert.strictEqual(typeof diagnosticsModule.createTestSimpleDiagnostics, "function");
	});

	test("diagnostics/markup entry point imports", () => {
		// Check markup builder functions
		assert.strictEqual(typeof markupModule.markup, "function");
		assert.strictEqual(typeof markupModule.text, "function");
		assert.strictEqual(typeof markupModule.paragraph, "function");
	});

	test("inspector entry point imports", () => {
		// Check inspector execution functions
		assert.strictEqual(typeof inspectorModule.runInspectors, "function");
	});

	test("reporter entry point imports", () => {
		// Check reporter functions
		assert.strictEqual(typeof reporterModule.createPrinter, "function");
		assert.strictEqual(typeof reporterModule.createXmlPrinter, "function");
	});
});
