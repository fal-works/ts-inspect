import {
	type Inspector,
	inspectProject,
	type SimpleLocationDiagnostic,
	translateSeverityToExitCode,
} from "@fal-works/ts-inspect";
import ts from "typescript";

type ConsoleLogFinding = {
	line: number;
	snippet: string;
};

function createConsoleLogInspector(): Inspector<ConsoleLogFinding[]> {
	return {
		name: "console-log-inspector",
		nodeInspectorFactory: (srcFile) => (node, recentResult) => {
			if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
				const expr = node.expression;
				if (expr.expression.getText(srcFile) === "console" && expr.name.text === "log") {
					const { line } = srcFile.getLineAndCharacterOfPosition(node.getStart(srcFile, false));
					const result = recentResult ?? [];
					result.push({
						line: line + 1, // 1-based
						snippet: node.getText(srcFile),
					});
					return result;
				}
			}
			return undefined; // unchanged
		},
		resultsBuilder: (perFile) => {
			const diagnostics: SimpleLocationDiagnostic[] = [];
			let total = 0;

			for (const { srcFile, result } of perFile) {
				if (result && result.length > 0) {
					total += result.length;
					for (const finding of result) {
						diagnostics.push({
							type: "location-simple",
							severity: "error",
							file: srcFile.file.fileName,
							line: finding.line,
							snippet: finding.snippet,
						});
					}
				}
			}

			return {
				inspectorName: "console-log-inspector",
				message: total > 0 ? `Found ${total} console.log calls` : undefined,
				diagnostics,
				advices:
					total > 0 ? "Consider using a proper logging library instead of console.log" : undefined,
			};
		},
	};
}

const status = await inspectProject(undefined, { inspectors: [createConsoleLogInspector()] });
process.exitCode = translateSeverityToExitCode(status);
