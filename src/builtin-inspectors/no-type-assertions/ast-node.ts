/**
 * AST node helper functions for type assertion detection.
 */

import ts from "typescript";

/**
 * Checks if an 'as' expression is 'as const'.
 * @package
 */
export function isAsConst(asExpr: ts.AsExpression): boolean {
	const t = asExpr.type;
	return (
		ts.isTypeReferenceNode(t) &&
		ts.isIdentifier(t.typeName) &&
		t.typeName.text === "const" &&
		!t.typeArguments
	);
}

/**
 * Checks if a type node represents 'unknown'.
 * @package
 */
export function isUnknownAssertion(type: ts.TypeNode): boolean {
	return type.kind === ts.SyntaxKind.UnknownKeyword;
}

/**
 * Checks if a node has an ignore comment.
 * @package
 */
export function hasIgnoreComment(srcFile: ts.SourceFile, node: ts.Node, ignoreComment: string): boolean {
	const text = srcFile.getFullText();

	// Check leading comments
	const leading = ts.getLeadingCommentRanges(text, node.getFullStart()) || [];
	for (const r of leading) {
		const comment = text.slice(r.pos, r.end);
		if (comment.includes(ignoreComment)) return true;
	}

	// Check trailing comments
	const trailing = ts.getTrailingCommentRanges(text, node.end) || [];
	for (const r of trailing) {
		const comment = text.slice(r.pos, r.end);
		if (comment.includes(ignoreComment)) return true;
	}

	return false;
}
