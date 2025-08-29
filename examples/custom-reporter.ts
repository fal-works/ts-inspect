import { inspectProject, translateSeverityToExitCode } from "@fal-works/ts-inspect";
import type { Reporter } from "@fal-works/ts-inspect/reporter";

const customReporter: Reporter = (results, output) => {
	output.write(`Found ${results.length} inspector results\n`);

	for (const result of results) {
		const { diagnostics } = result;
		let findingsCount = 0;

		if (diagnostics.type === "simple") {
			for (const fileScope of diagnostics.perFile.values()) {
				findingsCount += fileScope.locations.length;
			}
		} else if (diagnostics.type === "rich") {
			findingsCount += diagnostics.project.length;
			for (const fileScope of diagnostics.perFile.values()) {
				findingsCount += fileScope.wholeFile.length + fileScope.locations.length;
			}
		}

		if (findingsCount > 0) {
			output.write(`${result.inspectorName}: ${findingsCount} findings\n`);
		}
	}
};

const status = await inspectProject(undefined, { reporter: customReporter });
process.exitCode = translateSeverityToExitCode(status);
