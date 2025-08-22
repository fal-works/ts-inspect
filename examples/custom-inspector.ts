import {
	type CodeLocation,
	type DiagnosticDetails,
	type Inspector,
	inspectProject,
	type LocationDiagnostic,
	translateSeverityToExitCode,
} from "@fal-works/ts-inspect";
import ts from "typescript";

function createConsoleLogInspector(): Inspector<CodeLocation[]> {
	return {
		name: "console-log-inspector",
		nodeInspectorFactory: (srcFile) => (node, recentState) => {
			if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
				const expr = node.expression;
				if (expr.expression.getText(srcFile) === "console" && expr.name.text === "log") {
					const { line } = srcFile.getLineAndCharacterOfPosition(node.getStart(srcFile, false));
					const state = recentState ?? [];
					state.push({
						line: line + 1, // 1-based
						snippet: node.getText(srcFile),
					});
					return state;
				}
			}
			return undefined; // unchanged
		},
		resultsBuilder: (perFile) => {
			const items: LocationDiagnostic[] = [];
			let total = 0;

			for (const { srcFile, finalState } of perFile) {
				if (finalState && finalState.length > 0) {
					total += finalState.length;
					for (const finding of finalState) {
						items.push({
							type: "location",
							severity: "error",
							file: srcFile.file.fileName,
							location: finding,
						});
					}
				}
			}

			const details: DiagnosticDetails =
				total > 0
					? {
							message: "Found console.log calls.",
							advices: "Consider using a proper logging library instead of console.log",
						}
					: {
							message: "No console.log calls found.",
						};

			return {
				inspectorName: "console-log-inspector",
				diagnostics: { type: "simple", details, items },
			};
		},
	};
}

const status = await inspectProject(undefined, { inspectors: [createConsoleLogInspector()] });
process.exitCode = translateSeverityToExitCode(status);
