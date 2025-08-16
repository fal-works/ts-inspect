/**
 * Source file type definitions and parser exports.
 */

export type { ParsedSourceFile, ParsedSourceFileMetadata } from "./parsed.ts";
export { parseSourceFiles } from "./parser.ts";
export { inferParseSourceFilesOptions, type ParseSourceFilesOptions } from "./parser-options.ts";
