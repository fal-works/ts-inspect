/**
 * Results handler for collecting and informing type assertion findings.
 */

import type { ResultsHandler } from "../../inspector/index.ts";
import { IGNORE_COMMENT } from "./constants.ts";
import type { TypeAssertionInspectionResult } from "./types.ts";

/**
 * Generates a friendly message about type assertions.
 */
const noTypeAssertionsFriendlyMessage = () =>
	`
💡 Tip:
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
 * Default results handler for `TypeAssertionInspectionResult`.
 */
export const defaultResultsHandler: ResultsHandler<TypeAssertionInspectionResult> = (
	resultPerFile,
) => {
	if (resultPerFile.length === 0) return "success";

	console.group(`Found suspicious type assertions:`);
	for (const r of resultPerFile) {
		const file = r.srcFile.file.fileName;
		for (const found of r.result) {
			console.log("❌ ", `${file}:${found.line}`, "-", `${found.snippet}`);
		}
	}
	process.stdout.write("\n"); // empty line
	console.log(noTypeAssertionsFriendlyMessage());
	console.groupEnd();
	process.stdout.write("\n"); // empty line

	return "error";
};
