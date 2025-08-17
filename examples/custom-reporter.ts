import { inspectProject, type Reporter, translateSeverityToExitCode } from "@fal-works/ts-inspect";

const customReporter: Reporter = (results, output) => {
	// Write custom formatted output to the writable stream
	output.write(`Found ${results.length} inspector results\n`);

	for (const result of results) {
		if (result.diagnostics.items.length > 0) {
			output.write(`${result.inspectorName}: ${result.diagnostics.items.length} issues\n`);
		}
	}
};

const status = await inspectProject(undefined, { reporter: customReporter });
process.exitCode = translateSeverityToExitCode(status);
