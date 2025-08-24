/**
 * Results builder for collecting and structuring type assertion findings.
 */

import type { DiagnosticDetails, SimpleDiagnostics } from "../../diagnostics/index.ts";
import type { InspectorResult, ResultsBuilder } from "../../inspector/index.ts";
import { IGNORE_COMMENT } from "./constants.ts";
import type { TypeAssertionFindings } from "./types.ts";

/**
 * Generates a friendly message about type assertions.
 */
const noTypeAssertionsFriendlyMessage = () =>
	`Hint:
Type assertions (like \`as T\`) should be your last resort.

Stepwise Instructions:
1. Check assignability:
  If the value already satisfies the target type, just declare it with that type or pass it directly.
2. Resolve design issues:
  Needing assertions often means the types aren't aligned. Consider redesigning the types or data flow so the compiler can infer types safely.
3. Allow explicit exceptions:
  If you truly must keep it (e.g., for an isolated utility function or third-party integration), and if it is explicitly permitted by the code maintainer, then add the comment: \`/* ${IGNORE_COMMENT} */\`
4. Escalate if unresolved:
  If none of the above steps solve the issue, consult the code maintainer.
`.trim();

/**
 * Results builder for `TypeAssertionFindings`.
 */
export const resultsBuilder: ResultsBuilder<TypeAssertionFindings> = (resultPerFile) => {
	const perFile: SimpleDiagnostics["perFile"] = new Map();
	let totalFindings = 0;

	for (const r of resultPerFile) {
		const findings = r.finalState;
		if (findings.length > 0) {
			const file = r.srcFile.file.fileName;
			perFile.set(file, { locations: findings.map((found) => [found, { severity: "error" }]) });
			totalFindings += findings.length;
		}
	}

	const details: DiagnosticDetails =
		totalFindings > 0
			? {
					message: "Found suspicious type assertions.",
					instructions: noTypeAssertionsFriendlyMessage(),
				}
			: {
					message: "No suspicious type assertions found.",
					instructions: undefined,
				};

	const diagnostics: SimpleDiagnostics = {
		type: "simple",
		details,
		perFile,
	};

	const result: InspectorResult = {
		inspectorName: "no-type-assertions",
		diagnostics,
	};

	return result;
};
