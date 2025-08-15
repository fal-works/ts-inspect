import ts from "typescript";
import type { Inspector, ResultsHandler } from "../inspector/index.ts";

type AsAssertionFinding = {
	/**
	 * The line number where the assertion occurs (1-based).
	 */
	line: number;

	/**
	 * The code snippet where the assertion occurs.
	 */
	snippet: string;
};

type AsAssertionInspectionResult = AsAssertionFinding[];

const IGNORE_COMMENT = "UNAVOIDABLE_AS";

export const asAssertionFriendlyWarningMessage = () =>
	`
💡 TIPS:
Review these type assertions carefully. In most cases, \`as\` should be your last resort.
- **Prefer assignability over assertion:**
  If a value already matches a target type,
  just declare it with that type or pass it to a function that accepts that type.
- **Avoid \`as\` to work around design issues:**
  Needing assertions often means the types aren’t aligned.
  Consider redesigning the types or the data flow so the compiler can infer types safely.

If you truly must keep \`as\` e.g. this is an isolated utility function
or a third-party library integration, add a comment: /* UNAVOIDABLE_AS */
But be aware that this is a highly exceptional case.
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

function hasUnavoidableAsComment(sf: ts.SourceFile, node: ts.Node): boolean {
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

export function createAsAssertionInspector(
	resultsHandler?: ResultsHandler<AsAssertionInspectionResult>,
): Inspector<AsAssertionInspectionResult> {
	return {
		nodeInspectorFactory: (srcFile) => (node, recentResult) => {
			if (ts.isAsExpression(node) && !isAsConst(node) && !hasUnavoidableAsComment(srcFile, node)) {
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
		resultsHandler: resultsHandler ?? displayAsAssertionResults,
	};
}

const displayAsAssertionResults: ResultsHandler<AsAssertionInspectionResult> = (resultPerFile) => {
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
	console.warn(asAssertionFriendlyWarningMessage());
	console.groupEnd();
	console.log(); // empty line

	return "warn";
};
