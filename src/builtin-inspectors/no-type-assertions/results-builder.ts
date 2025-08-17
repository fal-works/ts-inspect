/**
 * Results builder for collecting and structuring type assertion findings.
 */

import type { LocationDiagnostic, SimpleDiagnostics } from "../../diagnostics/index.ts";
import type { InspectorResult, ResultsBuilder } from "../../inspector/index.ts";
import { IGNORE_COMMENT } from "./constants.ts";
import type { TypeAssertionFindings } from "./types.ts";

/**
 * Generates a friendly message about type assertions.
 */
const noTypeAssertionsFriendlyMessage = () =>
	`Tip:
Review these type assertions carefully. In most cases, type assertions (like \`as T\`) should be your last resort.
- Prefer assignability over assertion:
  If a value already matches a target type,
  just declare it with that type or pass it to a function that accepts that type.
- Avoid type assertions to work around design issues:
  Needing assertions often means the types aren't aligned.
  Consider redesigning the types or the data flow so the compiler can infer types safely.

If you truly must keep it e.g. it is an isolated utility function
or a third-party library integration, add a comment: /* ${IGNORE_COMMENT} */
But be aware that this is an exceptional case.
`.trim();

/**
 * Results builder for `TypeAssertionFindings`.
 */
export const resultsBuilder: ResultsBuilder<TypeAssertionFindings> = (resultPerFile) => {
	const diagnosticItems: LocationDiagnostic[] = [];

	for (const r of resultPerFile) {
		const file = r.srcFile.file.fileName;
		for (const found of r.finalState) {
			diagnosticItems.push({
				type: "location",
				severity: "error",
				file,
				line: found.line,
				snippet: found.snippet,
			});
		}
	}

	const diagnostics: SimpleDiagnostics = {
		type: "simple",
		items: diagnosticItems,
	};

	const result: InspectorResult = {
		inspectorName: "no-type-assertions",
		diagnostics,
	};

	if (diagnosticItems.length > 0) {
		result.message = "Found suspicious type assertions.";
		result.advices = noTypeAssertionsFriendlyMessage();
	}

	return result;
};
