import ts from "typescript";
import type { NodeInspectorFactory } from "../../inspector/index.ts";
import { hasIgnoreComment, isAsConst, isUnknownAssertion } from "./ast-node.ts";
import { IGNORE_COMMENT } from "./constants.ts";
import type { TypeAssertionInspectionResult } from "./types.ts";

/**
 * Creates a node inspector factory for detecting suspicious type assertions.
 */
export const createNodeInspectorFactory: NodeInspectorFactory<TypeAssertionInspectionResult> =
	(srcFile) => (node, recentResult) => {
		if (
			(ts.isAsExpression(node) &&
				!isAsConst(node) &&
				!isUnknownAssertion(node.type) &&
				!hasIgnoreComment(srcFile, node, IGNORE_COMMENT)) ||
			(ts.isTypeAssertionExpression(node) &&
				!isUnknownAssertion(node.type) &&
				!hasIgnoreComment(srcFile, node, IGNORE_COMMENT))
		) {
			const { line } = srcFile.getLineAndCharacterOfPosition(node.getStart(srcFile, false));
			const result = recentResult ?? [];
			result.push({
				line: line + 1,
				snippet: node.getText(srcFile),
			});
			return result;
		} else {
			return undefined;
		}
	};
