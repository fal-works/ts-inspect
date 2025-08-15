#!/usr/bin/env node

import { parseArgs } from "node:util";
import { inspectProject } from "./index.ts";

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
		},
	});

	switch (await inspectProject(values.project)) {
		case "success":
			return 0;
		case "warn":
			return 0;
		case "error":
			return 1;
	}
}

process.exitCode = await main();
