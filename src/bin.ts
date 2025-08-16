#!/usr/bin/env node

import { parseArgs } from "node:util";
import { inspectProject, translateStatusToExitCode } from "./index.ts";

/**
 * Main entry point for the CLI.
 *
 * @returns exit code
 */
async function main() {
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

process.exitCode = await main();
