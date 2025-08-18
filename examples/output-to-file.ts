import { createWriteStream } from "node:fs";
import { inspectProject, translateSeverityToExitCode } from "@fal-works/ts-inspect";

const outputStream = createWriteStream("inspection-results.txt", { encoding: "utf8" });
const status = await inspectProject(undefined, { output: outputStream });
outputStream.end();

console.log("Results written to inspection-results.txt");
process.exitCode = translateSeverityToExitCode(status);
