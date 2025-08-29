import { inspectProject, translateSeverityToExitCode } from "@fal-works/ts-inspect";
import type {
	CodeLocation,
	DiagnosticDetails,
	SimpleDiagnostics,
} from "@fal-works/ts-inspect/diagnostics";
import type { Inspector } from "@fal-works/ts-inspect/inspector";
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
			const perFileMap: SimpleDiagnostics["perFile"] = new Map();
			let totalFindings = 0;

			for (const r of perFile) {
				const findings = r.finalState;
				if (findings.length > 0) {
					const file = r.srcFile.file.fileName;
					perFileMap.set(file, {
						locations: findings.map((found) => [found, { severity: "error" }]),
					});
					totalFindings += findings.length;
				}
			}

			const details: DiagnosticDetails =
				totalFindings > 0
					? {
							message: `Found ${totalFindings} console.log calls.`,
							instructions: "Consider using a proper logging library instead of console.log",
						}
					: {
							message: "No console.log calls found.",
						};

			const diagnostics: SimpleDiagnostics = {
				type: "simple",
				details,
				perFile: perFileMap,
			};

			return {
				inspectorName: "console-log-inspector",
				diagnostics,
			};
		},
	};
}

const status = await inspectProject(undefined, { inspectors: [createConsoleLogInspector()] });
process.exitCode = translateSeverityToExitCode(status);
