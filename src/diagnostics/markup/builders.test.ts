/**
 * Unit tests for markup builders.
 */

import { deepStrictEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import {
	bulletList,
	code,
	example,
	exampleInput,
	exampleList,
	exampleOutput,
	hint,
	introducer,
	list,
	listItem,
	markup,
	orderedList,
	paragraph,
	stepwiseInstructionList,
	strong,
	task,
	text,
} from "./builders.ts";
import type {
	MarkupCodeElement,
	MarkupGeneralElementContent,
	MarkupListElement,
	MarkupListItemElement,
	MarkupParagraphElement,
	MarkupRootElement,
	MarkupStrongElement,
	MarkupTextLiteral,
} from "./types.ts";

describe("diagnostics/markup/builders", () => {
	describe("text", () => {
		it("creates a text node", () => {
			const expected: MarkupTextLiteral = {
				type: "text",
				value: "Hello world",
			};
			deepStrictEqual(text("Hello world"), expected);
		});
	});

	describe("code", () => {
		it("creates a code element without language", () => {
			const expected: MarkupCodeElement = {
				type: "element",
				name: "code",
				attributes: {},
				children: [{ type: "text", value: "const x = 42" }],
			};
			deepStrictEqual(code("const x = 42"), expected);
		});

		it("creates a code element with language", () => {
			const expected: MarkupCodeElement = {
				type: "element",
				name: "code",
				attributes: { language: "typescript" },
				children: [{ type: "text", value: "const x: number = 42" }],
			};
			deepStrictEqual(code("const x: number = 42", "typescript"), expected);
		});
	});

	describe("strong", () => {
		it("creates a strong element from string", () => {
			const expected: MarkupStrongElement = {
				type: "element",
				name: "strong",
				attributes: {},
				children: [{ type: "text", value: "important" }],
			};
			deepStrictEqual(strong("important"), expected);
		});

		it("creates a strong element from content array", () => {
			const content: MarkupGeneralElementContent[] = [text("very "), code("important", "text")];
			const expected: MarkupStrongElement = {
				type: "element",
				name: "strong",
				attributes: {},
				children: content,
			};
			deepStrictEqual(strong(content), expected);
		});
	});

	describe("paragraph", () => {
		it("creates a paragraph from string without caption", () => {
			const expected: MarkupParagraphElement = {
				type: "element",
				name: "paragraph",
				attributes: { intention: "introducer" },
				children: [{ type: "text", value: "Welcome" }],
			};
			deepStrictEqual(paragraph("introducer", "Welcome"), expected);
		});

		it("creates a paragraph from string with caption", () => {
			const expected: MarkupParagraphElement = {
				type: "element",
				name: "paragraph",
				attributes: { intention: "hint", caption: "Pro tip" },
				children: [{ type: "text", value: "Remember this" }],
			};
			deepStrictEqual(paragraph("hint", "Remember this", "Pro tip"), expected);
		});

		it("creates a paragraph from content array", () => {
			const content: MarkupGeneralElementContent[] = [
				text("Use "),
				code("npm install", "bash"),
				text(" to install"),
			];
			const expected: MarkupParagraphElement = {
				type: "element",
				name: "paragraph",
				attributes: { intention: "task" },
				children: content,
			};
			deepStrictEqual(paragraph("task", content), expected);
		});
	});

	describe("listItem", () => {
		it("creates a list item from string", () => {
			const expected: MarkupListItemElement = {
				type: "element",
				name: "list-item",
				attributes: {},
				children: [{ type: "text", value: "First item" }],
			};
			deepStrictEqual(listItem("First item"), expected);
		});

		it("creates a list item from content array", () => {
			const content: MarkupGeneralElementContent[] = [text("Item with "), strong("emphasis")];
			const expected: MarkupListItemElement = {
				type: "element",
				name: "list-item",
				attributes: {},
				children: content,
			};
			deepStrictEqual(listItem(content), expected);
		});
	});

	describe("list", () => {
		it("creates a list without caption", () => {
			const items = [listItem("First"), listItem("Second")];
			const expected: MarkupListElement = {
				type: "element",
				name: "list",
				attributes: { intention: "bullets" },
				children: items,
			};
			deepStrictEqual(list("bullets", items), expected);
		});

		it("creates a list with caption", () => {
			const items = [listItem("Step 1"), listItem("Step 2")];
			const expected: MarkupListElement = {
				type: "element",
				name: "list",
				attributes: { intention: "stepwise-instructions", caption: "Installation" },
				children: items,
			};
			deepStrictEqual(list("stepwise-instructions", items, "Installation"), expected);
		});
	});

	describe("markup", () => {
		it("creates a root markup element", () => {
			const content: MarkupGeneralElementContent[] = [
				paragraph("introducer", "Hello"),
				bulletList(["Item 1", "Item 2"]),
			];
			const expected: MarkupRootElement = {
				type: "element",
				name: "markup",
				attributes: {},
				children: content,
			};
			deepStrictEqual(markup(content), expected);
		});
	});

	describe("convenience helpers", () => {
		describe("bulletList", () => {
			it("creates a bullet list from strings", () => {
				const expected: MarkupListElement = {
					type: "element",
					name: "list",
					attributes: { intention: "bullets" },
					children: [
						{
							type: "element",
							name: "list-item",
							attributes: {},
							children: [{ type: "text", value: "First" }],
						},
						{
							type: "element",
							name: "list-item",
							attributes: {},
							children: [{ type: "text", value: "Second" }],
						},
					],
				};
				deepStrictEqual(bulletList(["First", "Second"]), expected);
			});

			it("creates a bullet list with caption", () => {
				const result = bulletList(["A", "B"], "Options");
				deepStrictEqual(result.attributes.caption, "Options");
			});

			it("creates a bullet list with mixed content types", () => {
				const result = bulletList([
					"Simple text item",
					[text("Complex item with "), code("code", "javascript")],
				]);
				deepStrictEqual(result.attributes.intention, "bullets");
				deepStrictEqual(result.children.length, 2);

				// First item should be simple text
				const firstItem = result.children[0];
				deepStrictEqual(firstItem.children, [{ type: "text", value: "Simple text item" }]);

				// Second item should be complex content
				const secondItem = result.children[1];
				deepStrictEqual(secondItem.children.length, 2);
				deepStrictEqual(secondItem.children[0], { type: "text", value: "Complex item with " });
			});
		});

		describe("orderedList", () => {
			it("creates an ordered list from strings", () => {
				const result = orderedList(["First", "Second"]);
				deepStrictEqual(result.attributes.intention, "ordered");
				deepStrictEqual(result.children.length, 2);
			});

			it("creates an ordered list with mixed content types", () => {
				const result = orderedList([
					"Step 1: Install",
					[text("Step 2: Run "), code("npm start", "bash")],
				]);
				deepStrictEqual(result.attributes.intention, "ordered");
				deepStrictEqual(result.children.length, 2);
			});
		});

		describe("steps", () => {
			it("creates a stepwise instructions list", () => {
				const result = stepwiseInstructionList(["Install", "Configure", "Run"], "Setup");
				deepStrictEqual(result.attributes.intention, "stepwise-instructions");
				deepStrictEqual(result.attributes.caption, "Setup");
				deepStrictEqual(result.children.length, 3);
			});

			it("creates a stepwise instructions list with mixed content", () => {
				const result = stepwiseInstructionList([
					"First step",
					[text("Run "), code("build", "bash"), text(" command")],
				]);
				deepStrictEqual(result.attributes.intention, "stepwise-instructions");
				deepStrictEqual(result.children.length, 2);
			});
		});

		describe("examples", () => {
			it("creates an examples list", () => {
				const result = exampleList(["Example 1", "Example 2"]);
				deepStrictEqual(result.attributes.intention, "examples");
				deepStrictEqual(result.children.length, 2);
			});

			it("creates an examples list with rich content", () => {
				const result = exampleList([
					[exampleInput([text("Input: "), code("hello", "text")])],
					[exampleOutput("Output: Hello!")],
				]);
				deepStrictEqual(result.attributes.intention, "examples");
				deepStrictEqual(result.children.length, 2);
			});
		});

		describe("introducer", () => {
			it("creates an introducer paragraph", () => {
				const result = introducer("Welcome to our system");
				deepStrictEqual(result.attributes.intention, "introducer");
				deepStrictEqual(result.children, [{ type: "text", value: "Welcome to our system" }]);
			});
		});

		describe("hint", () => {
			it("creates a hint paragraph from string", () => {
				const result = hint("Remember this");
				deepStrictEqual(result.attributes.intention, "hint");
				deepStrictEqual(result.children, [{ type: "text", value: "Remember this" }]);
			});

			it("creates a hint paragraph from content array", () => {
				const content = [text("Use "), code("--help")];
				const result = hint(content, "Tip");
				deepStrictEqual(result.attributes.intention, "hint");
				deepStrictEqual(result.attributes.caption, "Tip");
				deepStrictEqual(result.children, content);
			});
		});

		describe("task", () => {
			it("creates a task paragraph", () => {
				const result = task("Complete the implementation");
				deepStrictEqual(result.attributes.intention, "task");
			});
		});

		describe("example", () => {
			it("creates an example paragraph", () => {
				const result = example("Here is how it works", "Demo");
				deepStrictEqual(result.attributes.intention, "example");
				deepStrictEqual(result.attributes.caption, "Demo");
			});
		});

		describe("exampleInput", () => {
			it("creates an example-input paragraph", () => {
				const result = exampleInput("Input: user@example.com", "User Input");
				deepStrictEqual(result.attributes.intention, "example-input");
				deepStrictEqual(result.attributes.caption, "User Input");
			});
		});

		describe("exampleOutput", () => {
			it("creates an example-output paragraph", () => {
				const result = exampleOutput("Output: Welcome, user!", "Expected Result");
				deepStrictEqual(result.attributes.intention, "example-output");
				deepStrictEqual(result.attributes.caption, "Expected Result");
			});
		});
	});

	describe("complex composition", () => {
		it("creates a complex nested document", () => {
			const doc = markup([
				introducer([
					text("This is "),
					strong("important"),
					text(" information about "),
					code("TypeScript", "typescript"),
				]),
				hint("Remember to check the examples below"),
				list("examples", [
					listItem([text("Example 1: "), code('console.log("Hello")', "javascript")]),
					listItem([text("Example 2: "), code('alert("World")', "javascript")]),
				]),
				stepwiseInstructionList(["Install dependencies", "Run the build", "Deploy"], "Deployment"),
			]);

			deepStrictEqual(doc.type, "element");
			deepStrictEqual(doc.name, "markup");
			deepStrictEqual(doc.children.length, 4);

			// Verify first paragraph structure
			const firstPara = doc.children[0];
			deepStrictEqual(firstPara.type, "element");
			deepStrictEqual(firstPara.name, "paragraph");
			deepStrictEqual(firstPara.children.length, 4);
		});
	});
});
