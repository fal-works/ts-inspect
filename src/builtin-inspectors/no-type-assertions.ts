import ts from "typescript";
import type { Inspector, ResultsHandler } from "../inspector/index.ts";

type TypeAssertionFinding = {
	/**
	 * The line number where the assertion occurs (1-based).
	 */
	line: number;

	/**
	 * The code snippet where the assertion occurs.
	 */
	snippet: string;
};

export type TypeAssertionInspectionResult = TypeAssertionFinding[];

const IGNORE_COMMENT = "ignore-no-type-assertions";

const noTypeAssertionsFriendlyWarningMessage = () =>
	`
💡 Tip:
Review these type assertions carefully. In most cases, type assertions (like \`as T\`) should be your last resort.
- Prefer assignability over assertion:
  If a value already matches a target type,
  just declare it with that type or pass it to a function that accepts that type.
- Avoid type assertions to work around design issues:
  Needing assertions often means the types aren’t aligned.
  Consider redesigning the types or the data flow so the compiler can infer types safely.

If you truly must keep it e.g. it is an isolated utility function
or a third-party library integration, add a comment: /* ${IGNORE_COMMENT} */
But be aware that this is an exceptional case.
`.trim();

function isAsConst(asExpr: ts.AsExpression): boolean {
	const t = asExpr.type;
	return (
		ts.isTypeReferenceNode(t) &&
		ts.isIdentifier(t.typeName) &&
		t.typeName.text === "const" &&
		!t.typeArguments
	);
}

function isUnknownAssertion(type: ts.TypeNode): boolean {
	return type.kind === ts.SyntaxKind.UnknownKeyword;
}

function hasIgnoreComment(sf: ts.SourceFile, node: ts.Node): boolean {
	const text = sf.getFullText();

	// Check leading comments
	const leading = ts.getLeadingCommentRanges(text, node.getFullStart()) || [];
	for (const r of leading) {
		const comment = text.slice(r.pos, r.end);
		if (comment.includes(IGNORE_COMMENT)) return true;
	}

	// Check trailing comments
	const trailing = ts.getTrailingCommentRanges(text, node.end) || [];
	for (const r of trailing) {
		const comment = text.slice(r.pos, r.end);
		if (comment.includes(IGNORE_COMMENT)) return true;
	}

	return false;
}

export function createNoTypeAssertionsInspector(
	resultsHandler?: ResultsHandler<TypeAssertionInspectionResult>,
): Inspector<TypeAssertionInspectionResult> {
	return {
		nodeInspectorFactory: (srcFile) => (node, recentResult) => {
			if (
				(ts.isAsExpression(node) &&
					!isAsConst(node) &&
					!isUnknownAssertion(node.type) &&
					!hasIgnoreComment(srcFile, node)) ||
				(ts.isTypeAssertionExpression(node) &&
					!isUnknownAssertion(node.type) &&
					!hasIgnoreComment(srcFile, node))
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
		},
		resultsHandler: resultsHandler ?? displayResults,
	};
}

const displayResults: ResultsHandler<TypeAssertionInspectionResult> = (resultPerFile) => {
	if (resultPerFile.length === 0) return "success";

	console.warn(`Found suspicious type assertions:`);
	console.group();
	for (const r of resultPerFile) {
		const file = r.srcFile.file.fileName;
		for (const found of r.result) {
			console.warn("⚠️ ", `${file}:${found.line}`, "-", `${found.snippet}`);
		}
	}
	console.log(); // empty line
	console.warn(noTypeAssertionsFriendlyWarningMessage());
	console.groupEnd();
	console.log(); // empty line

	return "warn";
};
