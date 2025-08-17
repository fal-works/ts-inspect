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
			const statePerInspector: (unknown | null)[] = new Array(inspectorCount).fill(null);

			const inspectNode = (node: ts.Node) => {
				for (let i = 0; i < inspectorCount; ++i) {
					const lastState = statePerInspector[i];
					const ret = nodeInspectors[i](node, lastState);
					if (ret !== undefined) statePerInspector[i] = ret;
				}
				ts.forEachChild(node, inspectNode);
			};

			inspectNode(src.file);

			return { srcFile: src, statePerInspector };
		}),
	);

	const statesPerInspector: FileInspectionResult<unknown>[][] = Array.from(
		{ length: inspectorCount },
		() => [],
	);

	for (const processedFile of settled) {
		if (processedFile.status === "fulfilled") {
			for (let i = 0; i < inspectorCount; ++i) {
				const { srcFile, statePerInspector } = processedFile.value;
				const finalState = statePerInspector[i];
				if (finalState !== null) statesPerInspector[i].push({ srcFile, finalState });
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
		const resultPerFile = statesPerInspector[i];
		const inspectorResult = inspectors[i].resultsBuilder(resultPerFile);
		results.push(inspectorResult);
	}

	return results;
}
