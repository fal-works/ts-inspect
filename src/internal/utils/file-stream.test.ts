/**
 * Tests for file stream utilities.
 */

import assert from "node:assert";
import { before, describe, it } from "node:test";
import { prepareTestOutputDirectory } from "../../../test/test-utils.ts";
import { TsInspectError } from "../../error/index.ts";
import { executeWithFileOutput } from "./file-stream.ts";

describe("internal/utils/file-stream", () => {
	before(async () => {
		await prepareTestOutputDirectory("test-out/file-stream");
	});

	describe("executeWithFileOutput", () => {
		it("executes function with file output and proper cleanup", async () => {
			const filePath = "test-out/file-stream/output.txt";
			const expectedResult = { status: "success" };

			const result = await executeWithFileOutput(async (output) => {
				output.write("test content");
				return expectedResult;
			}, filePath);

			assert.deepStrictEqual(result, expectedResult);
		});

		it("handles function rejection properly", async () => {
			const filePath = "test-out/file-stream/rejection.txt";
			const expectedError = new Error("Function failed");

			await assert.rejects(
				() =>
					executeWithFileOutput(async () => {
						throw expectedError;
					}, filePath),
				expectedError,
			);
		});

		it("passes WriteStream to execution function", async () => {
			const filePath = "test-out/file-stream/write-stream.txt";
			let receivedStream: NodeJS.WritableStream | undefined;

			await executeWithFileOutput(async (output) => {
				receivedStream = output;
				output.write("content");
				return "done";
			}, filePath);

			assert.strictEqual(typeof receivedStream, "object");
			assert.strictEqual(receivedStream !== null, true);
			// WriteStream should have write method
			assert.ok(receivedStream && typeof receivedStream.write === "function");
		});

		it("creates nested directories automatically", async () => {
			const filePath = "test-out/file-stream/nested/auto-created/test.txt";
			const result = await executeWithFileOutput(async (output) => {
				output.write("nested content");
				return "success";
			}, filePath);

			assert.strictEqual(result, "success");
		});

		it("wraps stream errors with TsInspectError", async () => {
			const filePath = "test-out/file-stream/stream-error.txt";

			await assert.rejects(
				() =>
					executeWithFileOutput(async (output) => {
						// Force a stream error by ending early then writing
						output.end();
						output.write("this should fail");
						return "should not reach";
					}, filePath),
				(error: unknown) => {
					return (
						error instanceof TsInspectError && error.type.errorCode === "output-file-stream-error"
					);
				},
			);
		});
	});
});
