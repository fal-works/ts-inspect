#!/usr/bin/env node

import { inspectWithTsconfig } from "./index.ts";

/**
 * Main entry point for the CLI.
 *
 * @returns exit code
 */
async function main() {
	switch (await inspectWithTsconfig()) {
		case "success":
			return 0;
		case "warn":
			return 0;
		case "error":
			return 1;
	}
}

process.exitCode = await main();
