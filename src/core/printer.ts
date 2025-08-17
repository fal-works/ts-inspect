/**
 * Utility for building formatted text output with automatic indentation and grouping.
 */

import type { Writable } from "node:stream";

/**
 * Printer interface for building formatted text output with grouping and indentation.
 * Useful for creating human-readable reports, logs, or any hierarchical text output.
 */
export interface Printer {
	/** Print text without newline */
	print(text: string): void;
	/** Print text with newline */
	println(text: string): void;
	/** Print a single newline */
	newLine(): void;
	/** Start a new group with optional heading and increase indentation */
	group(heading?: string): void;
	/** End current group and decrease indentation */
	groupEnd(): void;
}

/**
 * Creates a new printer instance that writes formatted text to a writable stream.
 * Provides automatic indentation management for hierarchical output structures.
 */
export function createPrinter(output: Writable): Printer {
	let indentLevel = 0;
	const indentUnit = "  "; // 2 spaces
	let atLineStart = true;

	function writeText(text: string): void {
		if (atLineStart && text.length > 0) {
			for (let i = 0; i < indentLevel; i++) {
				output.write(indentUnit);
			}
			atLineStart = false;
		}
		output.write(text);
	}

	function newLine(): void {
		output.write("\n");
		atLineStart = true;
	}

	return {
		print(text: string): void {
			const lines = text.split("\n");
			for (let i = 0; i < lines.length; i++) {
				if (i > 0) {
					newLine();
				}
				writeText(lines[i]);
			}
		},

		println(text: string): void {
			this.print(text);
			newLine();
		},

		newLine(): void {
			newLine();
		},

		group(heading?: string): void {
			if (heading) {
				if (!atLineStart) {
					newLine(); // Ensure we're at line start before heading
				}
				this.println(heading);
			}
			indentLevel++;
		},

		groupEnd(): void {
			if (indentLevel > 0) {
				indentLevel--;
				if (!atLineStart) {
					newLine(); // Ensure we end at line start
				}
			}
		},
	};
}
