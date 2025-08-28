import assert from "node:assert";
import { describe, it } from "node:test";
import { formatCodeSnippet } from "./formatter.ts";

describe("builtin-reporters/summary/formatter", () => {
	describe("formatCodeSnippet", () => {
		it("returns single-line snippets unchanged", () => {
			assert.strictEqual(formatCodeSnippet("value as any"), "value as any");
			assert.strictEqual(formatCodeSnippet("user.name"), "user.name");
		});

		it("converts tabs to 4 spaces in single-line snippets", () => {
			assert.strictEqual(formatCodeSnippet("value\tas\tany"), "value    as    any");
		});

		it("handles multiline snippets with equal indentation", () => {
			const input = "if (condition) {\n    doSomething();\n    doOther();\n}";
			const expected = "if (condition) {\ndoSomething();\ndoOther();\n}";
			assert.strictEqual(formatCodeSnippet(input), expected);
		});

		it("handles multiline snippets with varying indentation", () => {
			const input = "function test() {\n    if (condition) {\n        doSomething();\n    }\n}";
			const expected = "function test() {\nif (condition) {\n    doSomething();\n}\n}";
			assert.strictEqual(formatCodeSnippet(input), expected);
		});

		it("preserves relative indentation", () => {
			const input = "block:\n    item1\n        subitem\n    item2";
			const expected = "block:\nitem1\n    subitem\nitem2";
			assert.strictEqual(formatCodeSnippet(input), expected);
		});

		it("handles empty lines in multiline snippets", () => {
			const input = "start\n    line1\n\n    line2\nend";
			const expected = "start\nline1\n\nline2\nend";
			assert.strictEqual(formatCodeSnippet(input), expected);
		});

		it("handles snippets with no indentation to remove", () => {
			const input = "line1\nline2\nline3";
			const expected = "line1\nline2\nline3";
			assert.strictEqual(formatCodeSnippet(input), expected);
		});

		it("converts tabs to spaces before processing indentation", () => {
			const input = "start\n\t\tindented with tabs\n\t\t\tmore indented";
			const expected = "start\nindented with tabs\n    more indented";
			assert.strictEqual(formatCodeSnippet(input), expected);
		});

		it("handles mixed tabs and spaces", () => {
			const input = "start\n\t  mixed\n\t    more mixed";
			// Tabs become 4 spaces: "\t  " becomes "    " (6 spaces), "\t    " becomes "        " (8 spaces)
			// Min indentation is 6, so remove 6 from each
			const expected = "start\nmixed\n  more mixed";
			assert.strictEqual(formatCodeSnippet(input), expected);
		});

		it("does not remove indentation from lines with less than minimum", () => {
			const input = "start\n  less indented\n      more indented\n    normal indented";
			// Min indentation from non-zero lines is 2
			// First line (2 spaces): remove 2 → "less indented"
			// Second line (6 spaces): remove 2 → "    more indented"
			// Third line (4 spaces): remove 2 → "  normal indented"
			const expected = "start\nless indented\n    more indented\n  normal indented";
			assert.strictEqual(formatCodeSnippet(input), expected);
		});

		it("handles lines with zero indentation in the middle", () => {
			const input = "start\n    indented\nno indent\n    indented again";
			// Lines with indentation: "    indented" (4), "    indented again" (4)
			// Min indentation is 4, but "no indent" has 0 spaces, so it's preserved
			const expected = "start\nindented\nno indent\nindented again";
			assert.strictEqual(formatCodeSnippet(input), expected);
		});

		it("handles whitespace-only lines properly", () => {
			const input = "start\n    line1\n      \n    line2";
			// The third line has only whitespace, which gets right-trimmed to empty
			// So min indentation is calculated from "    line1" and "    line2" = 4 spaces
			const expected = "start\nline1\n\nline2";
			assert.strictEqual(formatCodeSnippet(input), expected);
		});

		it("right-trims trailing whitespace from all lines", () => {
			const input = "start   \n    line1   \n    line2\t\t";
			const expected = "start\nline1\nline2";
			assert.strictEqual(formatCodeSnippet(input), expected);
		});
	});
});
