/**
 * Factory functions for composing markup documents intuitively.
 */

import type {
	BulletListIntentionType,
	MarkupBulletListElement,
	MarkupCodeElement,
	MarkupGeneralElementContent,
	MarkupListItemElement,
	MarkupOrderedListElement,
	MarkupParagraphElement,
	MarkupRootElement,
	MarkupStrongElement,
	MarkupTextLiteral,
	OrderedListIntentionType,
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
 * Creates a paragraph element with optional semantic intention.
 */
export function paragraph(
	content: StringOrContentNodes,
	intention?: ParagraphIntentionType,
	caption?: string,
): MarkupParagraphElement {
	const children: MarkupGeneralElementContent[] =
		typeof content === "string" ? [text(content)] : content;
	const attributes: MarkupParagraphElement["attributes"] =
		intention || caption ? { ...(intention && { intention }), ...(caption && { caption }) } : {};
	return {
		type: "element",
		name: "paragraph",
		attributes,
		children,
	};
}

/**
 * Creates a bullet list element with optional semantic intention.
 */
export function bulletList(
	items: MarkupListItemElement[],
	intention?: BulletListIntentionType,
	caption?: string,
): MarkupBulletListElement {
	const attributes: MarkupBulletListElement["attributes"] =
		intention || caption ? { ...(intention && { intention }), ...(caption && { caption }) } : {};

	return {
		type: "element",
		name: "bullet-list",
		attributes,
		children: items,
	};
}

/**
 * Creates an ordered list element with optional semantic intention.
 */
export function orderedList(
	items: MarkupListItemElement[],
	intention?: OrderedListIntentionType,
	caption?: string,
): MarkupOrderedListElement {
	const attributes: MarkupOrderedListElement["attributes"] =
		intention || caption ? { ...(intention && { intention }), ...(caption && { caption }) } : {};

	return {
		type: "element",
		name: "ordered-list",
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
 * Creates an introducer paragraph.
 */
export function introducer(
	content: StringOrContentNodes,
	caption?: string,
): MarkupParagraphElement {
	return paragraph(content, "introducer", caption);
}

/**
 * Creates a hint paragraph.
 */
export function hint(content: StringOrContentNodes, caption?: string): MarkupParagraphElement {
	return paragraph(content, "hint", caption);
}

/**
 * Creates a task paragraph.
 */
export function task(content: StringOrContentNodes, caption?: string): MarkupParagraphElement {
	return paragraph(content, "task", caption);
}

/**
 * Creates an example paragraph.
 */
export function example(content: StringOrContentNodes, caption?: string): MarkupParagraphElement {
	return paragraph(content, "example", caption);
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
	return paragraph(content, "example-input", caption);
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
	return paragraph(content, "example-output", caption);
}

/**
 * Creates an examples list.
 *
 * @param content - Typically an array of `example` elements (use `example()`).
 */
export function exampleList(
	items: StringOrContentNodes[],
	caption?: string,
): MarkupBulletListElement {
	return bulletList(
		items.map((item) => listItem(item)),
		"examples",
		caption,
	);
}

/**
 * Creates a stepwise instructions list.
 */
export function stepwiseInstructionList(
	items: StringOrContentNodes[],
	caption?: string,
): MarkupOrderedListElement {
	return orderedList(
		items.map((item) => listItem(item)),
		"stepwise-instructions",
		caption,
	);
}
