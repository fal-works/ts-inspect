import assert from "node:assert";
import { describe, it } from "node:test";
import { mockWritable } from "../../../../test/test-utils.ts";
import {
	createTestRichDiagnostics,
	createTestSimpleDiagnostics,
} from "../../../diagnostics/index.ts";
import type { InspectorResult } from "../../../inspector/index.ts";
import { createPrinter } from "../../../reporter/index.ts";
import { printInspectorResult } from "./inspector-result-printer.ts";

describe("main/builtin-reporters/summary/inspector-result-printer", () => {
	describe("printInspectorResult", () => {
		it("prints inspector result even without findings (since filtering happens upstream)", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "clean-inspector",
				diagnostics: createTestSimpleDiagnostics({ message: "No issues found." }, []),
			};

			printInspectorResult(result, printer);

			const outputText = output.getOutput();
			assert.ok(outputText.includes("[clean-inspector]"));
			assert.ok(outputText.includes("No issues found."));
		});

		it("prints simple inspector result with message and diagnostics", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "no-type-assertions",
				diagnostics: createTestSimpleDiagnostics({ message: "Found suspicious type assertions." }, [
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
				]),
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

		it("prints inspector result with message, diagnostics, and instructions", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "no-type-assertions",
				diagnostics: createTestSimpleDiagnostics(
					{
						message: "Found suspicious type assertions.",
						instructions: "Consider using proper typing instead of type assertions.",
					},
					[
						{
							type: "location",
							severity: "error",
							file: "src/test.ts",
							location: { line: 42, snippet: "value as any" },
						},
					],
				),
			};

			printInspectorResult(result, printer);

			const expected =
				"[no-type-assertions]\n" +
				"  Found suspicious type assertions.\n" +
				"\n" +
				"  ❌ src/test.ts:42 - value as any\n" +
				"\n" +
				"  Consider using proper typing instead of type assertions.\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints rich diagnostics with proper spacing", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "complex-inspector",
				diagnostics: createTestRichDiagnostics([
					{
						type: "location",
						severity: "error",
						file: "src/test1.ts",
						location: { line: 10, snippet: "first issue" },
						details: {
							message: "First diagnostic message",
							instructions: "How to fix the first issue",
						},
					},
					{
						type: "location",
						severity: "warning",
						file: "src/test2.ts",
						location: { line: 20, snippet: "second issue" },
						details: { message: "Second diagnostic message" },
					},
				]),
			};

			printInspectorResult(result, printer);

			const expected =
				"[complex-inspector]\n" +
				"\n" +
				"  ❌ src/test1.ts:10 - first issue\n" +
				"  First diagnostic message\n" +
				"  How to fix the first issue\n" +
				"\n" +
				"  ⚠️  src/test2.ts:20 - second issue\n" +
				"  Second diagnostic message\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("prints inspector result without message but with diagnostics", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "minimal-inspector",
				diagnostics: createTestSimpleDiagnostics({ message: "Found issues." }, [
					{
						type: "location",
						severity: "warning",
						file: "src/module.ts",
						location: { line: 1 }, // No snippet, so it will just show file:line
					},
				]),
			};

			printInspectorResult(result, printer);

			const expected = "[minimal-inspector]\n  Found issues.\n\n  ⚠️  src/module.ts:1\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("handles multiline snippets in simple diagnostics within inspector result", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "multiline-inspector",
				diagnostics: createTestSimpleDiagnostics({ message: "Found multiline issues." }, [
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
				]),
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

		it("uses newLine(1) for instructions to prevent excessive empty lines", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			// Print some content first to test newLine(1) behavior
			printer.println("Previous content");

			const result: InspectorResult = {
				inspectorName: "test-inspector",
				diagnostics: createTestSimpleDiagnostics(
					{
						message: "Found test issues.",
						instructions: "Some instructions",
					},
					[
						{
							type: "location",
							severity: "error",
							file: "src/test.ts",
							location: { line: 1, snippet: "test" },
						},
					],
				),
			};

			printInspectorResult(result, printer);

			const expected =
				"Previous content\n" +
				"[test-inspector]\n" +
				"  Found test issues.\n" +
				"\n" +
				"  ❌ src/test.ts:1 - test\n" +
				"\n" +
				"  Some instructions\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("handles project-level diagnostics in rich mode", () => {
			const output = mockWritable();
			const printer = createPrinter(output);
			const result: InspectorResult = {
				inspectorName: "architecture-inspector",
				diagnostics: createTestRichDiagnostics([
					{
						type: "location",
						severity: "warning",
						file: "(project-level issue)",
						location: { line: 1 },
						details: {
							message: "Circular dependency detected",
							instructions: "Refactor to remove circular imports",
						},
					},
				]),
			};

			printInspectorResult(result, printer);

			const expected =
				"[architecture-inspector]\n" +
				"\n" +
				"  ⚠️  (project-level issue):1\n" +
				"  Circular dependency detected\n" +
				"  Refactor to remove circular imports\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});

	describe("newline behavior verification", () => {
		it("ensures proper grouping and spacing between inspector results", () => {
			const output = mockWritable();
			const printer = createPrinter(output);

			const result1: InspectorResult = {
				inspectorName: "first-inspector",
				diagnostics: createTestSimpleDiagnostics({ message: "First inspector found issues." }, [
					{
						type: "location",
						severity: "error",
						file: "src/test1.ts",
						location: { line: 1, snippet: "issue1" },
					},
				]),
			};

			const result2: InspectorResult = {
				inspectorName: "second-inspector",
				diagnostics: createTestSimpleDiagnostics({ message: "Second inspector found issues." }, [
					{
						type: "location",
						severity: "warning",
						file: "src/test2.ts",
						location: { line: 2, snippet: "issue2" },
					},
				]),
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
