import assert from "node:assert";
import { describe, it } from "node:test";
import ts from "typescript";
import { createNoTypeAssertionsInspector } from "./no-type-assertions.ts";

describe("as-assertions", () => {
	describe("createAsAssertionInspector", () => {
		function createTestSourceFile(code: string): ts.SourceFile {
			return ts.createSourceFile("test.ts", code, ts.ScriptTarget.Latest, true);
		}

		function runInspectorOnCode(code: string) {
			const sourceFile = createTestSourceFile(code);
			const inspector = createNoTypeAssertionsInspector();
			const nodeInspector = inspector.nodeInspectorFactory(sourceFile);

			let result: any;
			function visit(node: ts.Node) {
				const newResult = nodeInspector(node, result);
				if (newResult !== undefined) {
					result = newResult;
				}
				ts.forEachChild(node, visit);
			}

			visit(sourceFile);
			return result;
		}

		it("detects suspicious as assertions", () => {
			const code = `const x = value as any;`;
			const result = runInspectorOnCode(code);

			assert.ok(result);
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].line, 1);
			assert.strictEqual(result[0].snippet, "value as any");
		});

		it("ignores as const assertions", () => {
			const code = `const x = [1, 2, 3] as const;`;
			const result = runInspectorOnCode(code);

			assert.strictEqual(result, undefined);
		});

		it("ignores assertions with UNAVOIDABLE_AS comment before", () => {
			const code = `const x = 
				/* UNAVOIDABLE_AS */
				value as any;`;
			const result = runInspectorOnCode(code);

			assert.strictEqual(result, undefined);
		});

		it("ignores assertions with UNAVOIDABLE_AS comment after", () => {
			const code = `const x = value as any /* UNAVOIDABLE_AS */;`;
			const result = runInspectorOnCode(code);

			assert.strictEqual(result, undefined);
		});

		it("detects multiple suspicious assertions", () => {
			const code = `
				const x = value1 as any;
				const y = value2 as string;
			`;
			const result = runInspectorOnCode(code);

			assert.ok(result);
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

			assert.ok(result);
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].line, 3);
		});

		it("handles complex as expressions", () => {
			const code = `const x = (obj.prop as SomeType).method();`;
			const result = runInspectorOnCode(code);

			assert.ok(result);
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].snippet, "obj.prop as SomeType");
		});

		it("detects type assertions that look like as const but are custom types", () => {
			const code = `
				type CustomConst = string;
				const x = value as CustomConst;
			`;
			const result = runInspectorOnCode(code);

			assert.ok(result);
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].snippet, "value as CustomConst");
		});
	});

	describe("inspector with custom results handler", () => {
		it("calls custom results handler", () => {
			const customHandler = () => "success" as const;

			const inspector = createNoTypeAssertionsInspector(customHandler);
			assert.strictEqual(inspector.resultsHandler, customHandler);
		});
	});
});
