#!/usr/bin/env node

import { parseArgs } from "node:util";
import { createRawJsonReporter, createSummaryReporter } from "./builtin-reporters/index.ts";
import { type InspectOptions, inspectProject, translateSeverityToExitCode } from "./index.ts";
import { executeWithFileOutput } from "./internal/utils/file-stream.ts";
import type { Reporter } from "./reporter/index.ts";

/**
 * Main CLI function without catching fatal errors.
 */
async function mainInternal(): Promise<0 | 1> {
	const { values } = parseArgs({
		options: {
			project: { type: "string", short: "p" },
			"exclude-test": { type: "boolean" },
			reporter: { type: "string" },
			output: { type: "string", short: "o" },
		},
	});

	// Resolve reporter from CLI argument
	let reporter: Reporter | undefined;
	if (values.reporter) {
		switch (values.reporter) {
			case "summary":
				reporter = createSummaryReporter();
				break;
			case "raw-json":
				reporter = createRawJsonReporter();
				break;
			default:
				throw new Error(
					`Unknown reporter: ${values.reporter}. Available options: summary, raw-json`,
				);
		}
	}

	const options: InspectOptions = {
		sourceFilesOptions: {
			excludeTest: values["exclude-test"],
		},
		...(reporter && { reporter }),
	};

	// Run the inspection with optional file output
	const status = values.output
		? await executeWithFileOutput(
				(output) => inspectProject(values.project, { ...options, output }),
				values.output,
			)
		: await inspectProject(values.project, options);

	return translateSeverityToExitCode(status);
}

/**
 * Main entry point for the CLI.
 *
 * @returns Exit code:
 * - `0`: Success: Tool ran successfully, no issues found or just warnings
 * - `1`: Inspection error: Tool ran successfully, but found code quality issues that need to be fixed
 * - `2`: Fatal error: Tool failed to run due to configuration/runtime errors or unexpected exceptions
 */
async function main(): Promise<0 | 1 | 2> {
	try {
		return await mainInternal();
	} catch (err) {
		console.error(err);
		return 2;
	}
}

process.exitCode = await main();
