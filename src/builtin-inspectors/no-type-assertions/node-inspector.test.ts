import assert from "node:assert";
import { describe, it } from "node:test";
import ts from "typescript";
import { createNodeInspectorFactory } from "./node-inspector.ts";
import type { TypeAssertionFindings } from "./types.ts";

describe("builtin-inspectors/no-type-assertions/node-inspector", () => {
	describe("createNodeInspectorFactory", () => {
		function createTestSourceFile(code: string): ts.SourceFile {
			return ts.createSourceFile("test.ts", code, ts.ScriptTarget.Latest, true);
		}

		function runInspectorOnCode(code: string): TypeAssertionFindings | null {
			const srcFile = createTestSourceFile(code);
			const nodeInspector = createNodeInspectorFactory(srcFile);

			let result: TypeAssertionFindings | null = null;
			function visit(node: ts.Node) {
				const newResult = nodeInspector(node, result);
				if (newResult !== undefined) {
					result = newResult;
				}
				ts.forEachChild(node, visit);
			}

			visit(srcFile);
			return result;
		}

		it("detects suspicious as assertions", () => {
			const code = `const x = value as any;`;
			const result = runInspectorOnCode(code);

			assert.ok(result !== null);
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].line, 1);
			assert.strictEqual(result[0].snippet, "value as any");
		});

		it("ignores as const assertions", () => {
			const code = `const x = [1, 2, 3] as const;`;
			const result = runInspectorOnCode(code);

			assert.strictEqual(result, null);
		});

		it("ignores as unknown assertions", () => {
			const code = `const x = value as unknown;`;
			const result = runInspectorOnCode(code);

			assert.strictEqual(result, null);
		});

		it("ignores angle bracket unknown assertions", () => {
			const code = `const x = <unknown>value;`;
			const result = runInspectorOnCode(code);

			assert.strictEqual(result, null);
		});

		it("ignores assertions with ignore comment before", () => {
			const code = `const x = 
				/* ignore-no-type-assertions */
				value as any;`;
			const result = runInspectorOnCode(code);

			assert.strictEqual(result, null);
		});

		it("ignores assertions with ignore comment after", () => {
			const code = `const x = value as any /* ignore-no-type-assertions */;`;
			const result = runInspectorOnCode(code);

			assert.strictEqual(result, null);
		});

		it("detects multiple suspicious assertions", () => {
			const code = `
				const x = value1 as any;
				const y = value2 as string;
			`;
			const result = runInspectorOnCode(code);

			assert.ok(result !== null);
			assert.strictEqual(result.length, 2);
			assert.strictEqual(result[0].snippet, "value1 as any");
			assert.strictEqual(result[1].snippet, "value2 as string");
		});

		it("reports correct line numbers", () => {
			const code = `
const x = 1;
const y = value as any;
const z = 2;
			`;
			const result = runInspectorOnCode(code);

			assert.ok(result !== null);
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].line, 3);
		});

		it("handles complex as expressions", () => {
			const code = `const x = (obj.prop as SomeType).method();`;
			const result = runInspectorOnCode(code);

			assert.ok(result !== null);
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].snippet, "obj.prop as SomeType");
		});

		it("detects type assertions that look like as const but are custom types", () => {
			const code = `
				type CustomConst = string;
				const x = value as CustomConst;
			`;
			const result = runInspectorOnCode(code);

			assert.ok(result !== null);
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].snippet, "value as CustomConst");
		});

		it("detects angle bracket type assertions", () => {
			const code = `const x = <any>value;`;
			const result = runInspectorOnCode(code);

			assert.ok(result !== null);
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].line, 1);
			assert.strictEqual(result[0].snippet, "<any>value");
		});

		it("detects multiple angle bracket type assertions", () => {
			const code = `
				const x = <any>value1;
				const y = <string>value2;
			`;
			const result = runInspectorOnCode(code);

			assert.ok(result !== null);
			assert.strictEqual(result.length, 2);
			assert.strictEqual(result[0].snippet, "<any>value1");
			assert.strictEqual(result[1].snippet, "<string>value2");
		});

		it("ignores angle bracket assertions with ignore comment", () => {
			const code = `const x = 
				/* ignore-no-type-assertions */
				<any>value;`;
			const result = runInspectorOnCode(code);

			assert.strictEqual(result, null);
		});

		it("detects both as and angle bracket assertions in same code", () => {
			const code = `
				const x = value1 as any;
				const y = <string>value2;
			`;
			const result = runInspectorOnCode(code);

			assert.ok(result !== null);
			assert.strictEqual(result.length, 2);
			assert.strictEqual(result[0].snippet, "value1 as any");
			assert.strictEqual(result[1].snippet, "<string>value2");
		});

		it("handles complex angle bracket expressions", () => {
			const code = `const x = (<SomeType>obj.prop).method();`;
			const result = runInspectorOnCode(code);

			assert.ok(result !== null);
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].snippet, "<SomeType>obj.prop");
		});
	});
});
