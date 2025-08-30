/**
 * Output file stream creation and lifecycle management.
 */

import { createWriteStream, type WriteStream } from "node:fs";
import { finished } from "node:stream/promises";
import { TsInspectError } from "../../error/index.ts";
import { ensureDirectoryExists } from "./file-system.ts";

/**
 * Represents an output file stream with its completion promise and metadata.
 */
interface OutputFileStream {
	readonly stream: WriteStream;
	readonly finished: Promise<void>;
	readonly filePath: string;
}

/**
 * Creates a write stream for the specified file path.
 */
function createFileWriteStream(filePath: string): WriteStream {
	return createWriteStream(filePath, { encoding: "utf8" });
}

/**
 * Creates a completion promise that wraps stream errors in TsInspectError.
 */
async function createStreamCompletionPromise(stream: WriteStream, filePath: string): Promise<void> {
	return finished(stream).catch((error) => {
		throw new TsInspectError({
			errorCode: "output-file-stream-error",
			filePath,
			originalError: error,
		});
	});
}

/**
 * Creates an output file stream with proper error handling.
 */
async function createOutputFileStream(filePath: string): Promise<OutputFileStream> {
	await ensureDirectoryExists(filePath);
	const stream = createFileWriteStream(filePath);

	try {
		const finished = createStreamCompletionPromise(stream, filePath);
		return { stream, finished, filePath };
	} catch (error) {
		stream.destroy(); // Immediate cleanup on any synchronous error
		throw error;
	}
}

/**
 * Executes a promise with fail-fast stream error handling.
 */
async function executeWithFailFast<T>(
	promise: Promise<T>,
	outputFileStream: OutputFileStream,
): Promise<T> {
	return await Promise.race([
		promise,
		outputFileStream.finished.then(() => {
			throw new TsInspectError({
				errorCode: "output-file-stream-unexpected-finish",
				filePath: outputFileStream.filePath,
			});
		}),
	]);
}

/**
 * Closes a stream and waits for completion.
 */
async function closeAndWaitForStream(outputFileStream: OutputFileStream): Promise<void> {
	outputFileStream.stream.end();
	await outputFileStream.finished;
}

/**
 * Executes a function with file output stream management.
 *
 * Creates an output file stream, passes it to the execution function,
 * and handles proper stream lifecycle with fail-fast error behavior.
 */
export async function executeWithFileOutput<T>(
	executionFn: (output: WriteStream) => Promise<T>,
	outputFilePath: string,
): Promise<T> {
	const outputFileStream = await createOutputFileStream(outputFilePath);
	const executionPromise = executionFn(outputFileStream.stream);
	const result = await executeWithFailFast(executionPromise, outputFileStream);
	await closeAndWaitForStream(outputFileStream);
	return result;
}
