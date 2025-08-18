#!/usr/bin/env node

import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { finished } from "node:stream/promises";
import { parseArgs } from "node:util";
import { TsInspectError } from "./error.ts";
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
	let output: { stream: ReturnType<typeof createWriteStream>; finished: Promise<void>; filePath: string } | undefined;
	if (values.output) {
		const outputPath = values.output;
		// Ensure output directory exists
		const outputDir = dirname(outputPath);
		await mkdir(outputDir, { recursive: true });
		const stream = createWriteStream(outputPath, { encoding: "utf8" });

		// Capture the completion/error promise up front using finished()
		const finishedPromise = finished(stream).catch((error) => {
			throw new TsInspectError({
				errorCode: "output-file-stream-error",
				filePath: outputPath,
				originalError: error,
			});
		});

		output = { stream, finished: finishedPromise, filePath: outputPath };
	}

	const options: InspectOptions = {
		sourceFilesOptions: {
			excludeTest: values["exclude-test"],
		},
		...(reporter && { reporter }),
		...(output && { output: output.stream }),
	};

	// Run the inspection with optional fail-fast on stream errors
	const inspectionPromise = inspectProject(values.project, options);

	let status: Awaited<ReturnType<typeof inspectProject>>;
	if (output) {
		// Race between inspection and stream errors for fail-fast behavior
		status = await Promise.race([
			inspectionPromise,
			output.finished.then(() => {
				throw new TsInspectError({ 
					errorCode: "output-file-stream-unexpected-finish",
					filePath: output.filePath
				});
			}),
		]);

		// Close the output stream and wait for it to finish
		output.stream.end();
		await output.finished; // This will throw TsInspectError if stream had errors
	} else {
		status = await inspectionPromise;
	}

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
