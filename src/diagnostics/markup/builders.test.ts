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
	listItem,
	markup,
	orderedList,
	paragraph,
	setCaption,
	stepwiseInstructionList,
	strong,
	task,
	text,
} from "./builders.ts";
import type {
	MarkupBulletListElement,
	MarkupCodeElement,
	MarkupGeneralElementContent,
	MarkupListItemElement,
	MarkupOrderedListElement,
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
		it("creates a paragraph without intention and caption", () => {
			const expected: MarkupParagraphElement = {
				type: "element",
				name: "paragraph",
				attributes: {},
				children: [{ type: "text", value: "Remember this" }],
			};
			deepStrictEqual(paragraph("Remember this"), expected);
		});

		it("creates a paragraph with intention and caption", () => {
			const expected: MarkupParagraphElement = {
				type: "element",
				name: "paragraph",
				attributes: { intention: "hint", caption: "Pro tip" },
				children: [{ type: "text", value: "Remember this" }],
			};
			deepStrictEqual(paragraph("Remember this", "hint", "Pro tip"), expected);
		});
	});

	describe("bulletList", () => {
		it("creates a bullet list without intention and caption", () => {
			const items = [listItem("First"), listItem("Second")];
			const expected: MarkupBulletListElement = {
				type: "element",
				name: "bullet-list",
				attributes: {},
				children: items,
			};
			deepStrictEqual(bulletList(items), expected);
		});

		it("creates a bullet list with intention and caption", () => {
			const items = [listItem("Example 1"), listItem("Example 2")];
			const expected: MarkupBulletListElement = {
				type: "element",
				name: "bullet-list",
				attributes: { intention: "examples", caption: "Examples" },
				children: items,
			};
			deepStrictEqual(bulletList(items, "examples", "Examples"), expected);
		});
	});

	describe("orderedList", () => {
		it("creates an ordered list without intention and caption", () => {
			const items = [listItem("Step 1"), listItem("Step 2")];
			const expected: MarkupOrderedListElement = {
				type: "element",
				name: "ordered-list",
				attributes: {},
				children: items,
			};
			deepStrictEqual(orderedList(items), expected);
		});

		it("creates an ordered list with intention and caption", () => {
			const items = [listItem("Step 1"), listItem("Step 2")];
			const expected: MarkupOrderedListElement = {
				type: "element",
				name: "ordered-list",
				attributes: { intention: "stepwise-instructions", caption: "Installation" },
				children: items,
			};
			deepStrictEqual(orderedList(items, "stepwise-instructions", "Installation"), expected);
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

	describe("markup", () => {
		it("creates a root markup element", () => {
			const content: MarkupGeneralElementContent[] = [
				paragraph("Hello", "introducer"),
				bulletList(["Item 1", "Item 2"].map(listItem)),
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
		describe("introducer", () => {
			it("creates an introducer paragraph", () => {
				const result = introducer("Welcome to our system");
				deepStrictEqual(result.attributes.intention, "introducer");
				deepStrictEqual(result.children, [{ type: "text", value: "Welcome to our system" }]);
			});
		});

		describe("hint", () => {
			it("creates a hint paragraph", () => {
				const result = hint("Remember this");
				deepStrictEqual(result.attributes.intention, "hint");
				deepStrictEqual(result.children, [{ type: "text", value: "Remember this" }]);
			});
		});

		describe("task", () => {
			it("creates a task paragraph", () => {
				const result = task("Complete the implementation");
				deepStrictEqual(result.attributes.intention, "task");
				deepStrictEqual(result.children, [{ type: "text", value: "Complete the implementation" }]);
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

		describe("exampleList", () => {
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

		describe("stepwiseInstructionList", () => {
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
				exampleList([
					[text("Example 1: "), code('console.log("Hello")', "javascript")],
					[text("Example 2: "), code('alert("World")', "javascript")],
				]),
				stepwiseInstructionList(["Install dependencies", "Run the build", "Deploy"], "Deployment"),
			]);

			deepStrictEqual(doc.type, "element");
			deepStrictEqual(doc.name, "markup");
			deepStrictEqual(doc.children.length, 4);

			// Verify first paragraph structure
			const firstParagraph = doc.children[0];
			deepStrictEqual(firstParagraph.type, "element");
			deepStrictEqual(firstParagraph.name, "paragraph");
			deepStrictEqual(firstParagraph.children.length, 4);
		});
	});

	describe("setCaption", () => {
		it("sets caption on an element", () => {
			const elem = paragraph("Some content");
			const result = setCaption("My Caption", elem);

			deepStrictEqual(result, elem); // Verifies it returns the same instance
			deepStrictEqual(elem.attributes.caption, "My Caption");
		});

		it("overwrites existing caption", () => {
			const elem = paragraph("Some content", "hint", "Old Caption");
			deepStrictEqual(elem.attributes.caption, "Old Caption");

			setCaption("New Caption", elem);
			deepStrictEqual(elem.attributes.caption, "New Caption");
		});

		it("works with lists", () => {
			const items: MarkupListItemElement[] = [listItem("Item 1"), listItem("Item 2")];
			const list = bulletList(items);

			setCaption("My List", list);
			deepStrictEqual(list.attributes.caption, "My List");
		});
	});
});
