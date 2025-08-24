/**
 * Factory functions for composing markup documents intuitively.
 */

import type {
	ListIntentionType,
	MarkupCodeElement,
	MarkupGeneralElementContent,
	MarkupListElement,
	MarkupListItemElement,
	MarkupParagraphElement,
	MarkupRootElement,
	MarkupStrongElement,
	MarkupTextLiteral,
	ParagraphIntentionType,
} from "./types.ts";

type StringOrContentNodes = string | MarkupGeneralElementContent[];

// ---- Core factory functions -----------------------------

/**
 * Creates a text node with the given value.
 */
export function text(value: string): MarkupTextLiteral {
	return { type: "text", value };
}

/**
 * Creates a code element with optional language specification.
 */
export function code(content: string, language?: string): MarkupCodeElement {
	const attributes: MarkupCodeElement["attributes"] = language ? { language } : {};

	return {
		type: "element",
		name: "code",
		attributes,
		children: [text(content)],
	};
}

/**
 * Creates a strong emphasis element.
 */
export function strong(content: StringOrContentNodes): MarkupStrongElement {
	const children: MarkupGeneralElementContent[] =
		typeof content === "string" ? [text(content)] : content;

	return {
		type: "element",
		name: "strong",
		attributes: {},
		children,
	};
}

/**
 * Creates a paragraph element with semantic intention.
 */
export function paragraph(
	intention: ParagraphIntentionType,
	content: StringOrContentNodes,
	caption?: string,
): MarkupParagraphElement {
	const children: MarkupGeneralElementContent[] =
		typeof content === "string" ? [text(content)] : content;
	const attributes: MarkupParagraphElement["attributes"] = caption
		? { intention, caption }
		: { intention };
	return {
		type: "element",
		name: "paragraph",
		attributes,
		children,
	};
}

/**
 * Creates a list element with semantic intention.
 */
export function list(
	intention: ListIntentionType,
	items: MarkupListItemElement[],
	caption?: string,
): MarkupListElement {
	const attributes: MarkupListElement["attributes"] = caption
		? { intention, caption }
		: { intention };

	return {
		type: "element",
		name: "list",
		attributes,
		children: items,
	};
}

/**
 * Creates a list item element.
 */
export function listItem(content: StringOrContentNodes): MarkupListItemElement {
	const children: MarkupGeneralElementContent[] =
		typeof content === "string" ? [text(content)] : content;

	return {
		type: "element",
		name: "list-item",
		attributes: {},
		children,
	};
}

/**
 * Creates a root markup element containing the document content.
 */
export function markup(content: MarkupGeneralElementContent[]): MarkupRootElement {
	return {
		type: "element",
		name: "markup",
		attributes: {},
		children: content,
	};
}

// ---- Convenience helpers --------------------------------

/**
 * Creates a bullet list from an array of strings.
 */
export function bulletList(items: StringOrContentNodes[], caption?: string): MarkupListElement {
	return list(
		"bullets",
		items.map((item) => listItem(item)),
		caption,
	);
}

/**
 * Creates an ordered list from an array of strings.
 */
export function orderedList(items: StringOrContentNodes[], caption?: string): MarkupListElement {
	return list(
		"ordered",
		items.map((item) => listItem(item)),
		caption,
	);
}

/**
 * Creates a stepwise instructions list from an array of strings.
 */
export function stepwiseInstructionList(
	items: StringOrContentNodes[],
	caption?: string,
): MarkupListElement {
	return list(
		"stepwise-instructions",
		items.map((item) => listItem(item)),
		caption,
	);
}

/**
 * Creates an examples list from an array of strings.
 *
 * @param content - Typically an array of `example` elements (use `example()`).
 */
export function exampleList(items: StringOrContentNodes[], caption?: string): MarkupListElement {
	return list(
		"examples",
		items.map((item) => listItem(item)),
		caption,
	);
}

/**
 * Creates an introducer paragraph.
 */
export function introducer(
	content: StringOrContentNodes,
	caption?: string,
): MarkupParagraphElement {
	return paragraph("introducer", content, caption);
}

/**
 * Creates a hint paragraph.
 */
export function hint(content: StringOrContentNodes, caption?: string): MarkupParagraphElement {
	return paragraph("hint", content, caption);
}

/**
 * Creates a task paragraph.
 */
export function task(content: StringOrContentNodes, caption?: string): MarkupParagraphElement {
	return paragraph("task", content, caption);
}

/**
 * Creates an example paragraph.
 */
export function example(content: StringOrContentNodes, caption?: string): MarkupParagraphElement {
	return paragraph("example", content, caption);
}

/**
 * Creates an example-input paragraph.
 *
 * Typically used inside an `example` paragraph to show input code.
 */
export function exampleInput(
	content: StringOrContentNodes,
	caption?: string,
): MarkupParagraphElement {
	return paragraph("example-input", content, caption);
}

/**
 * Creates an example-output paragraph.
 *
 * Typically used inside an `example` paragraph to show expected output.
 */
export function exampleOutput(
	content: StringOrContentNodes,
	caption?: string,
): MarkupParagraphElement {
	return paragraph("example-output", content, caption);
}
