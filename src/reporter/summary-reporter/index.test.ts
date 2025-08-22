import assert from "node:assert";
import { describe, it } from "node:test";
import { mockWritable } from "../../../test/test-utils.ts";
import type { InspectorResult } from "../../inspector/index.ts";
import { summaryReporter } from "./index.ts";

describe("reporter/summary-reporter/index", () => {
	describe("summaryReporter", () => {
		it("handles empty results array", () => {
			const output = mockWritable();
			const results: InspectorResult[] = [];

			summaryReporter(results, output);

			assert.strictEqual(output.getOutput(), "");
		});

		it("skips inspector results with no diagnostics", () => {
			const output = mockWritable();
			const results: InspectorResult[] = [
				{
					inspectorName: "clean-inspector",
					diagnostics: { type: "simple", details: { message: "No issues found." }, items: [] },
				},
				{
					inspectorName: "another-clean-inspector",
					diagnostics: { type: "rich", items: [] },
				},
			];

			summaryReporter(results, output);

			assert.strictEqual(output.getOutput(), "");
		});

		it("formats single inspector result", () => {
			const output = mockWritable();
			const results: InspectorResult[] = [
				{
					inspectorName: "no-type-assertions",
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
						details: {
							message: "Found suspicious type assertions.",
							advices: "Use proper typing instead.",
						},
					},
				},
			];

			summaryReporter(results, output);

			const expected =
				"[no-type-assertions]\n" +
				"  Found suspicious type assertions.\n" +
				"\n" +
				"  ❌ src/test.ts:42 - value as any\n" +
				"\n" +
				"  💡 Use proper typing instead.\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("formats multiple inspector results with proper spacing", () => {
			const output = mockWritable();
			const results: InspectorResult[] = [
				{
					inspectorName: "first-inspector",
					diagnostics: {
						type: "simple",
						items: [
							{
								type: "location",
								severity: "error",
								file: "src/test1.ts",
								location: { line: 10, snippet: "first issue" },
							},
						],
						details: { message: "First inspector issues." },
					},
				},
				{
					inspectorName: "second-inspector",
					diagnostics: {
						type: "simple",
						items: [
							{
								type: "module",
								severity: "warning",
								file: "src/module.ts",
							},
						],
						details: { message: "Second inspector issues." },
					},
				},
			];

			summaryReporter(results, output);

			const expected =
				"[first-inspector]\n" +
				"  First inspector issues.\n" +
				"\n" +
				"  ❌ src/test1.ts:10 - first issue\n" +
				"\n" +
				"[second-inspector]\n" +
				"  Second inspector issues.\n" +
				"\n" +
				"  ⚠️  src/module.ts\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("filters out clean inspectors from mixed results", () => {
			const output = mockWritable();
			const results: InspectorResult[] = [
				{
					inspectorName: "dirty-inspector",
					diagnostics: {
						type: "simple",
						items: [
							{
								type: "location",
								severity: "error",
								file: "src/issue.ts",
								location: { line: 5, snippet: "problem" },
							},
						],
						details: { message: "Found issues." },
					},
				},
				{
					inspectorName: "clean-inspector",
					diagnostics: { type: "simple", details: { message: "No issues found." }, items: [] },
				},
				{
					inspectorName: "another-dirty-inspector",
					diagnostics: {
						type: "simple",
						items: [
							{
								type: "module",
								severity: "info",
								file: "src/info.ts",
							},
						],
						details: { message: "Found issues." },
					},
				},
			];

			summaryReporter(results, output);

			const expected =
				"[dirty-inspector]\n" +
				"  Found issues.\n" +
				"\n" +
				"  ❌ src/issue.ts:5 - problem\n" +
				"\n" +
				"[another-dirty-inspector]\n" +
				"  Found issues.\n" +
				"\n" +
				"  ℹ️  src/info.ts\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("handles rich diagnostics with multiple items", () => {
			const output = mockWritable();
			const results: InspectorResult[] = [
				{
					inspectorName: "complex-inspector",
					diagnostics: {
						type: "rich",
						items: [
							{
								type: "location",
								severity: "error",
								file: "src/complex1.ts",
								location: { line: 15, snippet: "complex issue 1" },
								details: {
									message: "First complex issue",
									advices: "Fix the first issue",
								},
							},
							{
								type: "project",
								severity: "warning",
								details: {
									message: "Architecture problem",
									advices: "Refactor the architecture",
								},
							},
						],
					},
				},
			];

			summaryReporter(results, output);

			const expected =
				"[complex-inspector]\n" +
				"\n" +
				"  ❌ src/complex1.ts:15 - complex issue 1\n" +
				"  First complex issue\n" +
				"  Fix the first issue\n" +
				"\n" +
				"  ⚠️  (project-level issue)\n" +
				"  Architecture problem\n" +
				"  Refactor the architecture\n" +
				"\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("handles multiline snippets across multiple inspectors", () => {
			const output = mockWritable();
			const results: InspectorResult[] = [
				{
					inspectorName: "multiline-inspector",
					diagnostics: {
						type: "simple",
						items: [
							{
								type: "location",
								severity: "error",
								file: "src/multiline.ts",
								location: {
									line: 20,
									snippet: "{\n    prop: value as any,\n    other: 'test'\n}",
								},
							},
						],
						details: { message: "Found issues." },
					},
				},
				{
					inspectorName: "simple-inspector",
					diagnostics: {
						type: "simple",
						items: [
							{
								type: "location",
								severity: "warning",
								file: "src/simple.ts",
								location: { line: 5, snippet: "simple issue" },
							},
						],
						details: { message: "Found issues." },
					},
				},
			];

			summaryReporter(results, output);

			const expected =
				"[multiline-inspector]\n" +
				"  Found issues.\n" +
				"\n" +
				"  ❌ src/multiline.ts:20\n" +
				"  {\n" +
				"  prop: value as any,\n" +
				"  other: 'test'\n" +
				"  }\n" +
				"\n" +
				"\n" +
				"[simple-inspector]\n" +
				"  Found issues.\n" +
				"\n" +
				"  ⚠️  src/simple.ts:5 - simple issue\n";
			assert.strictEqual(output.getOutput(), expected);
		});

		it("ensures no trailing newline after last inspector result", () => {
			const output = mockWritable();
			const results: InspectorResult[] = [
				{
					inspectorName: "only-inspector",
					diagnostics: {
						type: "simple",
						items: [
							{
								type: "module",
								severity: "error",
								file: "src/test.ts",
							},
						],
						details: { message: "Found issues." },
					},
				},
			];

			summaryReporter(results, output);

			const expected = "[only-inspector]\n  Found issues.\n\n  ❌ src/test.ts\n";
			assert.strictEqual(output.getOutput(), expected);

			// Verify no trailing newline beyond what the inspector result itself produces
			assert.ok(!output.getOutput().endsWith("\n\n"));
		});
	});

	describe("integration with real-world scenarios", () => {
		it("handles typical no-type-assertions inspector output", () => {
			const output = mockWritable();
			const results: InspectorResult[] = [
				{
					inspectorName: "no-type-assertions",
					diagnostics: {
						type: "simple",
						items: [
							{
								type: "location",
								severity: "error",
								file: "src/utils.ts",
								location: { line: 15, snippet: "response.data as ApiResponse" },
							},
							{
								type: "location",
								severity: "error",
								file: "src/components/Form.tsx",
								location: { line: 42, snippet: "event.target as HTMLInputElement" },
							},
							{
								type: "location",
								severity: "error",
								file: "src/types.ts",
								location: { line: 8, snippet: "value as unknown as MyType" },
							},
						],
						details: {
							message: "Found suspicious type assertions.",
							advices:
								"Review these type assertions carefully. In most cases, type assertions should be your last resort.",
						},
					},
				},
			];

			summaryReporter(results, output);

			const expected =
				"[no-type-assertions]\n" +
				"  Found suspicious type assertions.\n" +
				"\n" +
				"  ❌ src/utils.ts:15 - response.data as ApiResponse\n" +
				"  ❌ src/components/Form.tsx:42 - event.target as HTMLInputElement\n" +
				"  ❌ src/types.ts:8 - value as unknown as MyType\n" +
				"\n" +
				"  💡 Review these type assertions carefully. In most cases, type assertions should be your last resort.\n";
			assert.strictEqual(output.getOutput(), expected);
		});
	});
});
