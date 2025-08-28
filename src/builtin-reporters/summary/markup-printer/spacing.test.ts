/**
 * Tests for markup printer spacing logic.
 */

import { strictEqual } from "node:assert";
import { describe, it } from "node:test";
import { bulletList, listItem, paragraph, text } from "../../../diagnostics/markup/builders.ts";
import { type PrintContext, shouldAddEmptyLineBefore } from "./spacing.ts";

describe("builtin-reporters/summary/markup-printer/spacing", () => {
	describe("shouldAddEmptyLineBefore", () => {
		it("returns false for text elements", () => {
			const element = text("Hello");
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: false,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), false);
		});

		it("returns false for first element in normal context", () => {
			const element = paragraph("Hello");
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: true,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), false);
		});

		it("returns true for non-first paragraph in normal context", () => {
			const element = paragraph("Hello");
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: false,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), true);
		});

		it("returns false for first paragraph inside list item", () => {
			const element = paragraph("Hello");
			const context: PrintContext = {
				isInsideListItem: true,
				isFirstElement: true,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), false);
		});

		it("returns false for non-first paragraph inside list item", () => {
			const element = paragraph("Hello");
			const context: PrintContext = {
				isInsideListItem: true,
				isFirstElement: false,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), false);
		});

		it("returns true for non-first list inside list item", () => {
			const element = bulletList([listItem("Item")]);
			const context: PrintContext = {
				isInsideListItem: true,
				isFirstElement: false,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), true);
		});

		it("returns false for first list inside list item", () => {
			const element = bulletList([listItem("Item")]);
			const context: PrintContext = {
				isInsideListItem: true,
				isFirstElement: true,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), false);
		});
	});
});
