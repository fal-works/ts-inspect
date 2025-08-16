import { type Inspector, inspectProject, translateStatusToExitCode } from "@fal-works/ts-inspect";
import ts from "typescript";

function createConsoleLogInspector(): Inspector<number> {
	return {
		nodeInspectorFactory: (srcFile) => (node, count) => {
			if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
				const expr = node.expression;
				if (expr.expression.getText(srcFile) === "console" && expr.name.text === "log") {
					return (count ?? 0) + 1;
				}
			}
			return undefined; // unchanged
		},
		resultsHandler: (perFile) => {
			if (!perFile.length) return "success";
			let total = 0;
			for (const { srcFile, result } of perFile) {
				if (result > 0) {
					total += result;
					console.log(`${srcFile.file.fileName}: ${result} console.log calls`);
				}
			}
			if (total === 0) return "success";
			console.log(`Total console.log calls: ${total}`);
			return "error";
		},
	};
}

const status = await inspectProject(undefined, { inspectors: [createConsoleLogInspector()] });
process.exitCode = translateStatusToExitCode(status);
