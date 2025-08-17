/**
 * Simple printer utility for formatted console output with automatic indentation.
 */

/**
 * Printer interface for building formatted output with grouping and indentation.
 */
export interface Printer {
	/** Print text without newline */
	print(text: string): void;
	/** Print text with newline */
	println(text: string): void;
	/** Start a new group with optional heading and increase indentation */
	group(heading?: string): void;
	/** End current group and decrease indentation */
	groupEnd(): void;
	/** Get the accumulated output as string */
	getOutput(): string;
}

/**
 * Creates a new printer instance.
 */
export function createPrinter(): Printer {
	const lines: string[] = [];
	let indentLevel = 0;
	const indentUnit = "  "; // 2 spaces

	function getIndent(): string {
		return indentUnit.repeat(indentLevel);
	}

	function addIndentedLines(text: string): void {
		const textLines = text.split("\n");
		const indent = getIndent();
		for (const line of textLines) lines.push(indent + line);
	}

	return {
		print(text: string): void {
			if (text.includes("\n")) {
				addIndentedLines(text);
			} else {
				lines.push(getIndent() + text);
			}
		},

		println(text: string): void {
			this.print(text);
			lines.push("");
		},

		group(heading?: string): void {
			if (heading) this.print(heading);
			indentLevel++;
		},

		groupEnd(): void {
			if (indentLevel > 0) {
				indentLevel--;
				lines.push(""); // Add empty line after group
			}
		},

		getOutput(): string {
			return lines.join("\n");
		},
	};
}
