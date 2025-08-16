import assert from "node:assert";
import { describe, it } from "node:test";
import { displayResults } from "./results-handler.ts";

describe("results-handler", () => {
	describe("displayResults", () => {
		function captureStdout(fn: () => void): string {
			const originalWrite = process.stdout.write;
			const originalLog = console.log;
			const originalGroup = console.group;
			const originalGroupEnd = console.groupEnd;

			let output = "";

			process.stdout.write = (chunk: any) => {
				output += chunk.toString();
				return true;
			};
			console.log = (...args: any[]) => {
				output += args.join(" ");
				output += "\n";
			};
			console.group = (label?: string) => {
				if (label) {
					output += label;
					output += "\n";
				}
			};
			console.groupEnd = () => {
				// no-op for testing
			};

			try {
				fn();
			} finally {
				process.stdout.write = originalWrite;
				console.log = originalLog;
				console.group = originalGroup;
				console.groupEnd = originalGroupEnd;
			}

			return output;
		}

		it("outputs to stdout when type assertions are found", () => {
			const mockResults = [
				{
					srcFile: {
						file: { fileName: "test.ts" },
					} as any,
					result: [
						{ line: 1, snippet: "value as any" },
						{ line: 2, snippet: "data as string" },
					],
				},
			];

			const output = captureStdout(() => {
				displayResults(mockResults);
			});

			assert.ok(output.includes("Found suspicious type assertions:"));
			assert.ok(output.includes("⚠️  test.ts:1 - value as any"));
			assert.ok(output.includes("⚠️  test.ts:2 - data as string"));
			assert.ok(output.includes("💡 Tip:"));
		});

		it("returns success status when no assertions found", () => {
			const result = displayResults([]);
			assert.strictEqual(result, "success");
		});

		it("returns warn status when assertions found", () => {
			const mockResults = [
				{
					srcFile: { file: { fileName: "test.ts" } } as any,
					result: [{ line: 1, snippet: "value as any" }],
				},
			];
			const result = displayResults(mockResults);
			assert.strictEqual(result, "warn");
		});
	});
});
