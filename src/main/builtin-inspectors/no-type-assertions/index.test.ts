/**
 * Unit tests for no-type-assertions inspector factory.
 */

import assert from "node:assert";
import { describe, it } from "node:test";
import { createNoTypeAssertionsInspector } from "./index.ts";

describe("main/builtin-inspectors/no-type-assertions/index", () => {
	describe("createNoTypeAssertionsInspector", () => {
		it("creates inspector with expected properties", () => {
			const inspector = createNoTypeAssertionsInspector();

			assert.strictEqual(typeof inspector, "object");
			assert.strictEqual(typeof inspector.name, "string");
			assert.strictEqual(inspector.name, "no-type-assertions");
			assert.strictEqual(typeof inspector.nodeInspectorFactory, "function");
			assert.strictEqual(typeof inspector.resultsBuilder, "function");
		});

		it("creates inspector that can be used in inspection workflow", () => {
			const inspector = createNoTypeAssertionsInspector();

			// Basic smoke test - should be able to create node inspector
			const mockSourceFile = {} as any; // Minimal mock for this test
			const nodeInspector = inspector.nodeInspectorFactory(mockSourceFile);
			assert.strictEqual(typeof nodeInspector, "function");

			// Should be able to call results builder
			const results = inspector.resultsBuilder([]);
			assert.strictEqual(typeof results, "object");
			assert.strictEqual(results.inspectorName, "no-type-assertions");
		});
	});
});
