/**
 * Components for working with structured markup representations.
 */

// Factory functions
export {
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

// Types and interfaces
export type {
	BulletListIntentionType,
	MarkupBulletListElement,
	MarkupCodeElement,
	MarkupElement,
	MarkupElementName,
	MarkupGeneralElementContent,
	MarkupListItemElement,
	MarkupNode,
	MarkupNodeType,
	MarkupOrderedListElement,
	MarkupParagraphElement,
	MarkupRootElement,
	MarkupStrongElement,
	MarkupTextLiteral,
	OrderedListIntentionType,
	ParagraphIntentionType,
} from "./types.ts";
