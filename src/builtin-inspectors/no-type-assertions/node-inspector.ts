/**
 * Node inspector for detecting suspicious type assertions.
 */

import ts from "typescript";
import type { NodeInspectorFactory } from "../../inspector/index.ts";
import { hasIgnoreComment, isAsConst, isUnknownAssertion } from "./ast-node.ts";
import { IGNORE_COMMENT } from "./constants.ts";
import type { TypeAssertionFindings } from "./types.ts";

/**
 * Determines if a TypeScript AST node is a suspicious type assertion.
 */
function isSuspiciousTypeAssertion(srcFile: ts.SourceFile, node: ts.Node): boolean {
	if ((ts.isAsExpression(node) && !isAsConst(node)) || ts.isTypeAssertionExpression(node)) {
		if (!isUnknownAssertion(node.type) && !hasIgnoreComment(srcFile, node, IGNORE_COMMENT)) {
			return true;
		}
	}

	return false;
}

/**
 * Creates a node inspector factory for detecting suspicious type assertions.
 */
export const createNodeInspectorFactory: NodeInspectorFactory<TypeAssertionFindings> =
	(srcFile) => (node, recentState) => {
		if (isSuspiciousTypeAssertion(srcFile, node)) {
			const { line } = srcFile.getLineAndCharacterOfPosition(node.getStart(srcFile, false));
			const state = recentState ?? [];
			state.push({
				line: line + 1,
				snippet: node.getText(srcFile),
			});
			return state;
		} else {
			return undefined;
		}
	};
