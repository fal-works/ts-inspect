/**
 * Results builder for collecting and structuring type assertion findings.
 */

import type { DiagnosticDetails, SimpleDiagnostics } from "../../diagnostics/index.ts";
import {
	code,
	hint,
	markup,
	paragraph,
	setCaption,
	stepwiseInstructionList,
	text,
} from "../../diagnostics/markup/builders.ts";
import type { InspectorResult, ResultsBuilder } from "../../inspector/index.ts";
import { IGNORE_COMMENT } from "./constants.ts";
import type { TypeAssertionFindings } from "./types.ts";

/**
 * Generates markup instructions about type assertions.
 */
const noTypeAssertionsFriendlyMessage = () =>
	markup([
		hint([text("Type assertions (like "), code("as T"), text(") should be your last resort.")]),
		stepwiseInstructionList([
			[
				setCaption(
					"Check assignability",
					paragraph(
						"If the value already satisfies the target type, just declare it with that type or pass it directly.",
					),
				),
			],
			[
				setCaption(
					"Resolve design issues",
					paragraph(
						[
							"Needing assertions often means the types aren't aligned.",
							"Consider redesigning the types or data flow so the compiler can infer types safely.",
						].join("\n"),
					),
				),
			],
			[
				setCaption(
					"Allow explicit exceptions",
					paragraph([
						text(
							[
								"If you truly must keep it (e.g., for an isolated utility function or third-party integration),",
								"and if it is explicitly permitted by the code maintainer,",
								"then add the comment: ",
							].join("\n"),
						),
						code(`/* ${IGNORE_COMMENT} */`),
					]),
				),
			],
			[
				setCaption(
					"Escalate if unresolved",
					paragraph("If none of the above steps solve the issue, consult the code maintainer."),
				),
			],
		]),
	]);

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
