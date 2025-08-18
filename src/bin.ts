#!/usr/bin/env node

import { createWriteStream } from "node:fs";
import { parseArgs } from "node:util";
import {
	type InspectOptions,
	inspectProject,
	type Reporter,
	rawJsonReporter,
	summaryReporter,
	translateSeverityToExitCode,
} from "./index.ts";

/**
 * Main CLI function without catching fatal errors.
 */
async function mainInternal(): Promise<0 | 1> {
	const { values } = parseArgs({
		options: {
			project: {
				type: "string",
				short: "p",
			},
			"exclude-test": {
				type: "boolean",
			},
			reporter: {
				type: "string",
			},
			output: {
				type: "string",
				short: "o",
			},
		},
	});

	// Resolve reporter from CLI argument
	let reporter: Reporter | undefined;
	if (values.reporter) {
		switch (values.reporter) {
			case "summary":
				reporter = summaryReporter;
				break;
			case "raw-json":
				reporter = rawJsonReporter;
				break;
			default:
				throw new Error(
					`Unknown reporter: ${values.reporter}. Available options: summary, raw-json`,
				);
		}
	}

	// Create output stream if --output is specified
	const output = values.output ? createWriteStream(values.output, { encoding: "utf8" }) : undefined;

	const options: InspectOptions = {
		sourceFilesOptions: {
			excludeTest: values["exclude-test"],
		},
		...(reporter && { reporter }),
		...(output && { output }),
	};

	const status = await inspectProject(values.project, options);

	// Close the output stream if we created one
	if (output) output.end();

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
