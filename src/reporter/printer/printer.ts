/**
 * Utility for building formatted text output with automatic indentation and grouping.
 */

import type { Writable } from "node:stream";

/**
 * Options for configuring printer behavior.
 */
export interface PrinterOptions {
	/**
	 * String used for each level of indentation.
	 * @default "  " (two spaces)
	 */
	indentUnit?: string;

	/**
	 * Initial indentation level to start printing at.
	 * @default 0
	 */
	initialIndentLevel?: number;
}

/**
 * Printer interface for building formatted text output with grouping and indentation.
 * Useful for creating human-readable reports, logs, or any hierarchical text output.
 */
export interface Printer {
	/**
	 * Print text without newline.
	 */
	print(text: string): void;

	/**
	 * Print text with newline.
	 */
	println(text: string): void;

	/**
	 * Print a single newline.
	 *
	 * @param maxEmptyLines - If provided, only writes newline if
	 *   consecutive empty lines don't reach the limit.
	 */
	newLine(maxEmptyLines?: number): void;

	/**
	 * Start a new group with optional heading and increase indentation.
	 *
	 * @param heading - If provided, it will be printed before the group content
	 *   at the current indentation level.
	 */
	group(heading?: string): void;

	/**
	 * End current group and decrease indentation.
	 */
	groupEnd(): void;

	/**
	 * Increase indentation level for subsequent lines.
	 * If called at line start, affects the current line.
	 * If called mid-line, affects only subsequent lines.
	 */
	indent(): void;

	/**
	 * Decrease indentation level for subsequent lines.
	 * If called at line start, affects the current line.
	 * If called mid-line, affects only subsequent lines.
	 */
	dedent(): void;
}

/**
 * Internal state for the printer.
 */
interface PrinterState {
	readonly indentUnit: string;
	readonly output: Writable;
	readonly initialIndentLevel: number;
	indentLevel: number;
	atLineStart: boolean;
	consecutiveLineFeeds: number;
}

/**
 * Internal function to write text, handling indentation and line start.
 */
function writeText(state: PrinterState, text: string): void {
	if (state.atLineStart && text.length > 0) {
		for (let i = 0; i < state.indentLevel; i++) {
			state.output.write(state.indentUnit);
		}
		state.atLineStart = false;
		state.consecutiveLineFeeds = 0; // Reset when writing content
	}
	state.output.write(text);
}

/**
 * @see Printer.print
 */
function print(state: PrinterState, text: string): void {
	const lines = text.split("\n");
	for (let i = 0; i < lines.length; i++) {
		if (i > 0) {
			newLine(state);
		}
		writeText(state, lines[i]);
	}
}

/**
 * @see Printer.println
 */
function println(state: PrinterState, text: string): void {
	print(state, text);
	newLine(state);
}

/**
 * @see Printer.newLine
 */
function newLine(state: PrinterState, maxEmptyLines?: number): void {
	// Convert maxEmptyLines to maxConsecutiveLineFeeds
	if (maxEmptyLines !== undefined && state.consecutiveLineFeeds >= maxEmptyLines + 1) {
		return; // Don't write newline if limit reached
	}

	state.output.write("\n");
	state.atLineStart = true;
	state.consecutiveLineFeeds++;
}

/**
 * @see Printer.group
 */
function group(state: PrinterState, heading?: string): void {
	if (heading) {
		if (!state.atLineStart) {
			newLine(state); // Ensure we're at line start before heading
		}
		println(state, heading);
	}
	indent(state);
}

/**
 * @see Printer.groupEnd
 */
function groupEnd(state: PrinterState): void {
	dedent(state);
	if (!state.atLineStart) {
		newLine(state); // Ensure we end at line start
	}
}

/**
 * @see Printer.indent
 */
function indent(state: PrinterState): void {
	state.indentLevel++;
}

/**
 * @see Printer.dedent
 */
function dedent(state: PrinterState): void {
	if (state.indentLevel > state.initialIndentLevel) {
		state.indentLevel--;
	}
}

/**
 * Creates a new printer instance that writes formatted text to a writable stream.
 * Provides automatic indentation management for hierarchical output structures.
 *
 * @param output - The stream to write formatted text to, e.g. `process.stdout`.
 * @param options - Optional configuration for the printer.
 */
export function createPrinter(output: Writable, options?: PrinterOptions): Printer {
	const initialIndentLevel = options?.initialIndentLevel ?? 0;
	const state: PrinterState = {
		indentUnit: options?.indentUnit ?? "  ", // Default: 2 spaces
		output,
		initialIndentLevel,
		indentLevel: initialIndentLevel,
		atLineStart: true,
		consecutiveLineFeeds: 0,
	};

	return {
		print: print.bind(null, state),
		println: println.bind(null, state),
		newLine: newLine.bind(null, state),
		group: group.bind(null, state),
		groupEnd: groupEnd.bind(null, state),
		indent: indent.bind(null, state),
		dedent: dedent.bind(null, state),
	};
}
