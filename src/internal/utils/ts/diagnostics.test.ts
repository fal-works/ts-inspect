import assert from "node:assert";
import { describe, it } from "node:test";
import ts from "typescript";
import { formatDiagnostics } from "./diagnostics.ts";

describe("internal/utils/ts/diagnostics", () => {
	describe("formatDiagnostics", () => {
		it("formats empty diagnostics array", () => {
			const result = formatDiagnostics([]);
			assert.strictEqual(result, "");
		});

		it("formats single diagnostic without color", () => {
			const diagnostic: ts.Diagnostic = {
				file: undefined,
				start: undefined,
				length: undefined,
				messageText: "Test error message",
				category: ts.DiagnosticCategory.Error,
				code: 1234,
			};

			const result = formatDiagnostics([diagnostic], false);
			assert.ok(result.includes("Test error message"));
			assert.ok(result.includes("1234"));
		});

		it("formats multiple diagnostics without color", () => {
			const diagnostics: ts.Diagnostic[] = [
				{
					file: undefined,
					start: undefined,
					length: undefined,
					messageText: "First error",
					category: ts.DiagnosticCategory.Error,
					code: 1001,
				},
				{
					file: undefined,
					start: undefined,
					length: undefined,
					messageText: "Second error",
					category: ts.DiagnosticCategory.Warning,
					code: 2002,
				},
			];

			const result = formatDiagnostics(diagnostics, false);
			assert.ok(result.includes("First error"));
			assert.ok(result.includes("Second error"));
			assert.ok(result.includes("1001"));
			assert.ok(result.includes("2002"));
		});

		it("defaults to with color and context", () => {
			const diagnostic: ts.Diagnostic = {
				file: undefined,
				start: undefined,
				length: undefined,
				messageText: "Test message",
				category: ts.DiagnosticCategory.Error,
				code: 9999,
			};

			const withColor = formatDiagnostics([diagnostic]);
			const withoutColor = formatDiagnostics([diagnostic], false);

			// Results might be different due to color formatting
			assert.ok(withColor.includes("Test message"));
			assert.ok(withoutColor.includes("Test message"));
		});
	});
});
