import assert from "node:assert";
import { describe, it } from "node:test";
import ts from "typescript";
import { hasIgnoreComment, isAsConst, isUnknownAssertion } from "./ast-node.ts";

describe("ast-node", () => {
	function createTestSourceFile(code: string): ts.SourceFile {
		return ts.createSourceFile("test.ts", code, ts.ScriptTarget.Latest, true);
	}

	function findFirstAsExpression(srcFile: ts.SourceFile): ts.AsExpression | null {
		let result: ts.AsExpression | null = null;
		function visit(node: ts.Node) {
			if (ts.isAsExpression(node) && !result) {
				result = node;
				return;
			}
			ts.forEachChild(node, visit);
		}
		visit(srcFile);
		return result;
	}

	function findFirstTypeAssertion(srcFile: ts.SourceFile): ts.TypeAssertion | null {
		let result: ts.TypeAssertion | null = null;
		function visit(node: ts.Node) {
			if (ts.isTypeAssertionExpression(node) && !result) {
				result = node;
				return;
			}
			ts.forEachChild(node, visit);
		}
		visit(srcFile);
		return result;
	}

	function findFirstTypeNode(srcFile: ts.SourceFile): ts.TypeNode | null {
		let result: ts.TypeNode | null = null;
		function visit(node: ts.Node) {
			if (ts.isAsExpression(node) && !result) {
				result = node.type;
				return;
			}
			if (ts.isTypeAssertionExpression(node) && !result) {
				result = node.type;
				return;
			}
			ts.forEachChild(node, visit);
		}
		visit(srcFile);
		return result;
	}

	describe("isAsConst", () => {
		it("returns true for 'as const' expressions", () => {
			const code = `const x = [1, 2, 3] as const;`;
			const srcFile = createTestSourceFile(code);
			const asExpr = findFirstAsExpression(srcFile);

			assert.ok(asExpr !== null);
			assert.strictEqual(isAsConst(asExpr), true);
		});

		it("returns false for regular type assertions", () => {
			const code = `const x = value as string;`;
			const srcFile = createTestSourceFile(code);
			const asExpr = findFirstAsExpression(srcFile);

			assert.ok(asExpr !== null);
			assert.strictEqual(isAsConst(asExpr), false);
		});

		it("returns false for 'as any' expressions", () => {
			const code = `const x = value as any;`;
			const srcFile = createTestSourceFile(code);
			const asExpr = findFirstAsExpression(srcFile);

			assert.ok(asExpr !== null);
			assert.strictEqual(isAsConst(asExpr), false);
		});

		it("returns false for custom types that contain 'const'", () => {
			const code = `
				type CustomConst = string;
				const x = value as CustomConst;
			`;
			const srcFile = createTestSourceFile(code);
			const asExpr = findFirstAsExpression(srcFile);

			assert.ok(asExpr !== null);
			assert.strictEqual(isAsConst(asExpr), false);
		});

		it("returns false for generic const with type arguments", () => {
			const code = `const x = value as const<string>;`;
			const srcFile = createTestSourceFile(code);
			const asExpr = findFirstAsExpression(srcFile);

			assert.ok(asExpr !== null);
			assert.strictEqual(isAsConst(asExpr), false);
		});
	});

	describe("isUnknownAssertion", () => {
		it("returns true for 'unknown' type nodes", () => {
			const code = `const x = value as unknown;`;
			const srcFile = createTestSourceFile(code);
			const typeNode = findFirstTypeNode(srcFile);

			assert.ok(typeNode !== null);
			assert.strictEqual(isUnknownAssertion(typeNode), true);
		});

		it("returns true for angle bracket 'unknown' assertions", () => {
			const code = `const x = <unknown>value;`;
			const srcFile = createTestSourceFile(code);
			const typeNode = findFirstTypeNode(srcFile);

			assert.ok(typeNode !== null);
			assert.strictEqual(isUnknownAssertion(typeNode), true);
		});

		it("returns false for other type assertions", () => {
			const code = `const x = value as string;`;
			const srcFile = createTestSourceFile(code);
			const typeNode = findFirstTypeNode(srcFile);

			assert.ok(typeNode !== null);
			assert.strictEqual(isUnknownAssertion(typeNode), false);
		});

		it("returns false for 'any' type assertions", () => {
			const code = `const x = value as any;`;
			const srcFile = createTestSourceFile(code);
			const typeNode = findFirstTypeNode(srcFile);

			assert.ok(typeNode !== null);
			assert.strictEqual(isUnknownAssertion(typeNode), false);
		});
	});

	describe("hasIgnoreComment", () => {
		it("returns true when ignore comment is present before the node", () => {
			const code = `const x = 
				/* ignore-no-type-assertions */
				value as any;`;
			const srcFile = createTestSourceFile(code);
			const asExpr = findFirstAsExpression(srcFile);

			assert.ok(asExpr !== null);
			assert.strictEqual(hasIgnoreComment(srcFile, asExpr, "ignore-no-type-assertions"), true);
		});

		it("returns true when ignore comment is present after the node", () => {
			const code = `const x = value as any /* ignore-no-type-assertions */;`;
			const srcFile = createTestSourceFile(code);
			const asExpr = findFirstAsExpression(srcFile);

			assert.ok(asExpr !== null);
			assert.strictEqual(hasIgnoreComment(srcFile, asExpr, "ignore-no-type-assertions"), true);
		});

		it("returns false when no ignore comment is present", () => {
			const code = `const x = value as any;`;
			const srcFile = createTestSourceFile(code);
			const asExpr = findFirstAsExpression(srcFile);

			assert.ok(asExpr !== null);
			assert.strictEqual(hasIgnoreComment(srcFile, asExpr, "ignore-no-type-assertions"), false);
		});

		it("returns false when different comment text is present", () => {
			const code = `const x = value as any /* some other comment */;`;
			const srcFile = createTestSourceFile(code);
			const asExpr = findFirstAsExpression(srcFile);

			assert.ok(asExpr !== null);
			assert.strictEqual(hasIgnoreComment(srcFile, asExpr, "ignore-no-type-assertions"), false);
		});

		it("works with angle bracket assertions", () => {
			const code = `const x = 
				/* ignore-no-type-assertions */
				<any>value;`;
			const srcFile = createTestSourceFile(code);
			const typeAssertion = findFirstTypeAssertion(srcFile);

			assert.ok(typeAssertion !== null);
			assert.strictEqual(
				hasIgnoreComment(srcFile, typeAssertion, "ignore-no-type-assertions"),
				true,
			);
		});

		it("allows custom ignore comment text", () => {
			const code = `const x = value as any /* custom-ignore */;`;
			const srcFile = createTestSourceFile(code);
			const asExpr = findFirstAsExpression(srcFile);

			assert.ok(asExpr !== null);
			assert.strictEqual(hasIgnoreComment(srcFile, asExpr, "custom-ignore"), true);
			assert.strictEqual(hasIgnoreComment(srcFile, asExpr, "ignore-no-type-assertions"), false);
		});
	});
});
