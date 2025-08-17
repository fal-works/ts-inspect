/**
 * Inspector execution engine that runs multiple inspectors on source files.
 */

import ts from "typescript";
import type { ParsedSourceFile } from "../source-file/index.ts";
import type { FileInspectionResult, Inspector } from "./inspector.ts";
import type { InspectorResults } from "./inspector-result.ts";

/**
 * Inspects all the given source files using the provided inspectors,
 * then runs the results builder for each inspector.
 */
export async function runInspectors(
	// biome-ignore lint/suspicious/noExplicitAny: We can't use the unknown type here because this should accept inspectors with variadic types.
	inspectors: Inspector<any>[],
	srcFiles: Promise<ParsedSourceFile>[],
): Promise<InspectorResults> {
	const inspectorCount = inspectors.length;

	const settled = await Promise.allSettled(
		srcFiles.map(async (srcFilePromise) => {
			const src = await srcFilePromise;
			const nodeInspectors = inspectors.map((inspector) =>
				inspector.nodeInspectorFactory(src.file),
			);
			const resultPerInspector: (unknown | null)[] = new Array(inspectorCount).fill(null);

			const inspectNode = (node: ts.Node) => {
				for (let i = 0; i < inspectorCount; ++i) {
					const lastResult = resultPerInspector[i];
					const ret = nodeInspectors[i](node, lastResult);
					if (ret !== undefined) resultPerInspector[i] = ret;
				}
				ts.forEachChild(node, inspectNode);
			};

			inspectNode(src.file);

			return { srcFile: src, resultPerInspector };
		}),
	);

	const resultsPerInspector: FileInspectionResult<unknown>[][] = Array.from(
		{ length: inspectorCount },
		() => [],
	);

	for (const processedFile of settled) {
		if (processedFile.status === "fulfilled") {
			for (let i = 0; i < inspectorCount; ++i) {
				const { srcFile, resultPerInspector } = processedFile.value;
				const result = resultPerInspector[i];
				if (result !== null) resultsPerInspector[i].push({ srcFile, result });
			}
		} else {
			console.error("Error occurred during source file inspection:");
			console.group();
			console.error(processedFile.reason);
			console.groupEnd();
			console.error(); // empty line
			// Continue processing other files even if one fails
		}
	}

	const results: InspectorResults = [];

	for (let i = 0; i < inspectorCount; ++i) {
		const resultPerFile = resultsPerInspector[i];
		const inspectorResult = inspectors[i].resultsBuilder(resultPerFile);
		results.push(inspectorResult);
	}

	return results;
}
