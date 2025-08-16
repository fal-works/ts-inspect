#!/usr/bin/env node

import { parseArgs } from "node:util";
import { inspectProject, translateStatusToExitCode } from "./index.ts";

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
		},
	});

	const status = await inspectProject(values.project, {
		sourceFilesOptions: {
			excludeTest: values["exclude-test"],
		},
	});

	return translateStatusToExitCode(status);
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
