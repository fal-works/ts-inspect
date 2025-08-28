/**
 * Tests for markup printer utilities.
 */

import { strictEqual } from "node:assert";
import { describe, it } from "node:test";
import {
	bulletList,
	listItem,
	paragraph,
	strong,
	text,
} from "../../../diagnostics/markup/builders.ts";
import { hasNonTextElements, intentionToString } from "./utils.ts";

describe("builtin-reporters/summary/markup-printer/utils", () => {
	describe("intentionToString", () => {
		it("converts single word to title case", () => {
			strictEqual(intentionToString("hint"), "Hint");
		});

		it("converts kebab-case to title case", () => {
			strictEqual(intentionToString("stepwise-instructions"), "Stepwise Instructions");
		});

		it("handles multiple hyphens", () => {
			strictEqual(intentionToString("multi-word-example-case"), "Multi Word Example Case");
		});
	});

	describe("hasNonTextElements", () => {
		it("returns false for only text elements", () => {
			const children = [text("Hello"), text(" world")];
			strictEqual(hasNonTextElements(children), false);
		});

		it("returns false for text and formatting elements", () => {
			const children = [text("Hello "), strong("bold"), text(" world")];
			strictEqual(hasNonTextElements(children), false);
		});

		it("returns true when paragraph is present", () => {
			const children = [text("Hello"), paragraph("A paragraph")];
			strictEqual(hasNonTextElements(children), true);
		});

		it("returns true when bullet list is present", () => {
			const children = [text("Hello"), bulletList([listItem("Item")])];
			strictEqual(hasNonTextElements(children), true);
		});

		it("returns true when multiple structural elements are present", () => {
			const children = [paragraph("Para"), bulletList([listItem("Item")])];
			strictEqual(hasNonTextElements(children), true);
		});
	});
});
