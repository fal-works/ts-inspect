/**
 * Test helper utilities for creating diagnostic structures.
 * @package
 */

import type { CodeLocation, DiagnosticDetails, DiagnosticSeverity } from "./common-types.ts";
import type { RichDiagnostics, SimpleDiagnostics } from "./diagnostic-types.ts";
import type { DetailedFinding, Finding } from "./finding-types.ts";

/**
 * Creates a simple diagnostics structure for testing.
 * @package
 */
export function createTestSimpleDiagnostics(
	details: DiagnosticDetails,
	items?: Array<{
		type: "location";
		severity: DiagnosticSeverity;
		file: string;
		location: CodeLocation;
	}>,
): SimpleDiagnostics {
	const perFile = new Map<string, { locations: [CodeLocation, Finding][] }>();

	if (items) {
		for (const item of items) {
			const file = item.file;
			const fileScope = perFile.get(file) ?? { locations: [] };
			fileScope.locations.push([item.location, { severity: item.severity }]);
			perFile.set(file, fileScope);
		}
	}

	return {
		type: "simple",
		details,
		perFile,
	};
}

/**
 * Creates a rich diagnostics structure for testing.
 * @package
 */
export function createTestRichDiagnostics(
	items?: Array<{
		type: "location" | "file" | "project";
		severity: DiagnosticSeverity;
		file?: string;
		location?: CodeLocation;
		details: { message: string; advices?: string };
	}>,
): RichDiagnostics {
	const project: DetailedFinding[] = [];
	const perFile = new Map<
		string,
		{ wholeFile: DetailedFinding[]; locations: [CodeLocation, DetailedFinding][] }
	>();

	if (items) {
		for (const item of items) {
			const finding: DetailedFinding = {
				severity: item.severity,
				message: item.details.message,
				...(item.details.advices && { advices: item.details.advices }),
			};

			if (item.type === "project") {
				project.push(finding);
			} else if (item.type === "file" && item.file) {
				const fileScope = perFile.get(item.file) ?? { wholeFile: [], locations: [] };
				fileScope.wholeFile.push(finding);
				perFile.set(item.file, fileScope);
			} else if (item.type === "location" && item.file && item.location) {
				const fileScope = perFile.get(item.file) ?? { wholeFile: [], locations: [] };
				fileScope.locations.push([item.location, finding]);
				perFile.set(item.file, fileScope);
			}
		}
	}

	return {
		type: "rich",
		project,
		perFile,
	};
}
