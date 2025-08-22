import assert from "node:assert";
import { describe, it } from "node:test";
import { mockWritable } from "../../../test/test-utils.ts";
import { createPrinter } from "../../core/printer.ts";
import type { InspectorResult } from "../../inspector/index.ts";
import { printInspectorResult } from "./inspector-result-printer.ts";

describe("reporter/summary-reporter/inspector-result-printer", () => {
	describe("printInspectorResult", () => {
		it("skips inspector results with no issues", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "clean-inspector",
				diagnostics: { type: "simple", items: [] },
			};

			printInspectorResult(result, printer);

			assert.strictEqual(output.getOutput(), "");
		});

		it("prints simple inspector result with message and diagnostics", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "no-type-assertions",
				message: "Found suspicious type assertions.",
				diagnostics: {
					type: "simple",
					items: [
						{
							type: "location",
							severity: "error",
							file: "src/test.ts",
							location: { line: 42, snippet: "value as any" },
						},
						{
							type: "location",
							severity: "error",
							file: "src/test.ts",
							location: { line: 50, snippet: "data as string" },
						},
					],
				},
			};

			printInspectorResult(result, printer);

			const expected =
				"[no-type-assertions]\n" +
				"  Found suspicious type assertions.\n" +
				"\n" +
				"  ❌ src/test.ts:42 - value as any\n" +
				"  ❌ src/test.ts:50 - data as string\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints inspector result with message, diagnostics, and advice", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "no-type-assertions",
				message: "Found suspicious type assertions.",
				diagnostics: {
					type: "simple",
					items: [
						{
							type: "location",
							severity: "error",
							file: "src/test.ts",
							location: { line: 42, snippet: "value as any" },
						},
					],
				},
				advices: "Consider using proper typing instead of type assertions.",
			};

			printInspectorResult(result, printer);

			const expected =
				"[no-type-assertions]\n" +
				"  Found suspicious type assertions.\n" +
				"\n" +
				"  ❌ src/test.ts:42 - value as any\n" +
				"\n" +
				"  💡 Consider using proper typing instead of type assertions.\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints rich diagnostics with proper spacing", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "complex-inspector",
				message: "Found complex issues.",
				diagnostics: {
					type: "rich",
					items: [
						{
							type: "location",
							severity: "error",
							file: "src/test1.ts",
							location: { line: 10, snippet: "first issue" },
							message: "First diagnostic message",
							advices: "How to fix the first issue",
						},
						{
							type: "location",
							severity: "warning",
							file: "src/test2.ts",
							location: { line: 20, snippet: "second issue" },
							message: "Second diagnostic message",
						},
					],
				},
			};

			printInspectorResult(result, printer);

			const expected =
				"[complex-inspector]\n" +
				"  Found complex issues.\n" +
				"\n" +
				"  ❌ src/test1.ts:10 - first issue\n" +
				"  First diagnostic message\n" +
				"  How to fix the first issue\n" +
				"\n" +
				"  ⚠️  src/test2.ts:20 - second issue\n" +
				"  Second diagnostic message\n" +
				"\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints inspector result without message but with diagnostics", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "minimal-inspector",
				diagnostics: {
					type: "simple",
					items: [
						{
							type: "module",
							severity: "warning",
							file: "src/module.ts",
						},
					],
				},
			};

			printInspectorResult(result, printer);

			const expected = "[minimal-inspector]\n\n  ⚠️  src/module.ts\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints inspector result with only advice (no message or diagnostics)", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "advice-only-inspector",
				diagnostics: {
					type: "simple",
					items: [
						{
							type: "location",
							severity: "info",
							file: "src/info.ts",
							location: { line: 1, snippet: "info item" },
						},
					],
				},
				advices: "General advice for the codebase",
			};

			printInspectorResult(result, printer);

			const expected =
				"[advice-only-inspector]\n" +
				"\n" +
				"  ℹ️  src/info.ts:1 - info item\n" +
				"\n" +
				"  💡 General advice for the codebase\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("handles multiline snippets in simple diagnostics within inspector result", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "multiline-inspector",
				message: "Found multiline issues.",
				diagnostics: {
					type: "simple",
					items: [
						{
							type: "location",
							severity: "error",
							file: "src/complex.ts",
							location: {
								line: 15,
								snippet: "{\n    prop: value as any,\n    other: 'test'\n}",
							},
						},
						{
							type: "location",
							severity: "error",
							file: "src/simple.ts",
							location: { line: 5, snippet: "simple as string" },
						},
					],
				},
			};

			printInspectorResult(result, printer);

			const expected =
				"[multiline-inspector]\n" +
				"  Found multiline issues.\n" +
				"\n" +
				"  ❌ src/complex.ts:15\n" +
				"  {\n" +
				"  prop: value as any,\n" +
				"  other: 'test'\n" +
				"  }\n" +
				"\n" +
				"  ❌ src/simple.ts:5 - simple as string\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("uses newLine(1) for advice to prevent excessive empty lines", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			// Print some content first to test newLine(1) behavior
			printer.println("Previous content");

			const result: InspectorResult = {
				inspectorName: "test-inspector",
				diagnostics: {
					type: "simple",
					items: [
						{
							type: "location",
							severity: "error",
							file: "src/test.ts",
							location: { line: 1, snippet: "test" },
						},
					],
				},
				advices: "Some advice",
			};

			printInspectorResult(result, printer);

			const expected =
				"Previous content\n" +
				"[test-inspector]\n" +
				"\n" +
				"  ❌ src/test.ts:1 - test\n" +
				"\n" +
				"  💡 Some advice\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("handles project-level diagnostics in rich mode", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "architecture-inspector",
				message: "Architecture violations detected.",
				diagnostics: {
					type: "rich",
					items: [
						{
							type: "project",
							severity: "warning",
							message: "Circular dependency detected",
							advices: "Refactor to remove circular imports",
						},
					],
				},
			};

			printInspectorResult(result, printer);

			const expected =
				"[architecture-inspector]\n" +
				"  Architecture violations detected.\n" +
				"\n" +
				"  ⚠️  (project-level issue)\n" +
				"  Circular dependency detected\n" +
				"  Refactor to remove circular imports\n" +
				"\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});

	describe("newline behavior verification", () => {
		it("ensures proper grouping and spacing between inspector results", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			const result1: InspectorResult = {
				inspectorName: "first-inspector",
				message: "First inspector found issues.",
				diagnostics: {
					type: "simple",
					items: [
						{
							type: "location",
							severity: "error",
							file: "src/test1.ts",
							location: { line: 1, snippet: "issue1" },
						},
					],
				},
			};

			const result2: InspectorResult = {
				inspectorName: "second-inspector",
				message: "Second inspector found issues.",
				diagnostics: {
					type: "simple",
					items: [
						{
							type: "location",
							severity: "warning",
							file: "src/test2.ts",
							location: { line: 2, snippet: "issue2" },
						},
					],
				},
			};

			printInspectorResult(result1, printer);
			printer.newLine(); // Simulate spacing between inspector results
			printInspectorResult(result2, printer);

			const expected =
				"[first-inspector]\n" +
				"  First inspector found issues.\n" +
				"\n" +
				"  ❌ src/test1.ts:1 - issue1\n" +
				"\n" +
				"[second-inspector]\n" +
				"  Second inspector found issues.\n" +
				"\n" +
				"  ⚠️  src/test2.ts:2 - issue2\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});
});
