/**
 * Types and interfaces for a structured markup representation.
 */

import type * as xast from "xast"; // Using namespace import to help prevent accidental type leaks
import { assertExtends } from "../../internal/utils/type-utils.ts";

// -------------------- Literal types --------------------

/** Discriminator for markup node types */
export type MarkupNodeType = "text" | "element";

/** Valid element names in the markup DSL */
export type MarkupElementName =
	| "markup"
	| "code"
	| "strong"
	| "paragraph"
	| "bullet-list"
	| "ordered-list"
	| "list-item";

/** Semantic intention types for paragraph elements */
export type ParagraphIntentionType =
	| "introducer"
	| "hint"
	| "task"
	| "example"
	| "example-input"
	| "example-output";

/** Semantic intention types for bullet list elements (currently only one) */
export type BulletListIntentionType = "examples";

/** Semantic intention types for ordered list elements (currently only one) */
export type OrderedListIntentionType = "stepwise-instructions";

// ---- Base types -----------------------------------------

/** Base interface for all markup nodes */
export interface MarkupNode {
	type: MarkupNodeType;
}

/** Base interface for element nodes with common properties */
interface MarkupElementBase extends MarkupNode {
	type: "element";
	name: MarkupElementName;
}

// ---- Node types -----------------------------------------

/** Plain text content node */
export interface MarkupTextLiteral extends MarkupNode {
	type: "text";
	value: string;
}

/** Root container element for markup documents */
export interface MarkupRootElement extends MarkupElementBase {
	name: "markup";
	attributes: Record<string, never>;
	children: MarkupGeneralElementContent[];
}

/** Inline code element with optional language specification */
export interface MarkupCodeElement extends MarkupElementBase {
	name: "code";
	attributes: { language?: "typescript" | "javascript" | string };
	children: [MarkupTextLiteral];
}

/** Emphasis element for highlighting important content */
export interface MarkupStrongElement extends MarkupElementBase {
	name: "strong";
	attributes: Record<string, never>;
	children: MarkupGeneralElementContent[];
}

/** Paragraph element with optional semantic intention and caption */
export interface MarkupParagraphElement extends MarkupElementBase {
	name: "paragraph";
	attributes: { intention?: ParagraphIntentionType; caption?: string };
	children: MarkupGeneralElementContent[];
}

/** Bullet list container element with optional semantic intention and caption */
export interface MarkupBulletListElement extends MarkupElementBase {
	name: "bullet-list";
	attributes: { intention?: BulletListIntentionType; caption?: string };
	children: MarkupListItemElement[];
}

/** Ordered list container element with optional semantic intention and caption */
export interface MarkupOrderedListElement extends MarkupElementBase {
	name: "ordered-list";
	attributes: { intention?: OrderedListIntentionType; caption?: string };
	children: MarkupListItemElement[];
}

/** Individual item within a list element */
export interface MarkupListItemElement extends MarkupElementBase {
	name: "list-item";
	attributes: Record<string, never>;
	children: MarkupGeneralElementContent[];
}

// ---- Union types ----------------------------------------

/** Union of all possible element types */
export type MarkupElement =
	| MarkupRootElement
	| MarkupCodeElement
	| MarkupStrongElement
	| MarkupParagraphElement
	| MarkupBulletListElement
	| MarkupOrderedListElement
	| MarkupListItemElement;

/** Content that can appear within general container elements */
export type MarkupGeneralElementContent =
	| MarkupTextLiteral
	| MarkupCodeElement
	| MarkupStrongElement
	| MarkupParagraphElement
	| MarkupBulletListElement
	| MarkupOrderedListElement;

// ---- Ensuring type compatibility ------------------------

/*#__PURE__*/ assertExtends<xast.Node, MarkupNode>();
/*#__PURE__*/ assertExtends<xast.Text, MarkupTextLiteral>();
/*#__PURE__*/ assertExtends<xast.Element, MarkupElement>();
