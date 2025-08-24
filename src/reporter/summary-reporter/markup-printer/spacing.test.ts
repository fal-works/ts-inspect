/**
 * Tests for markup printer spacing logic.
 */

import { strictEqual } from "node:assert";
import { describe, it } from "node:test";
import { bulletList, listItem, paragraph, text } from "../../../diagnostics/markup/builders.ts";
import { type PrintContext, shouldAddEmptyLineAfter, shouldAddEmptyLineBefore } from "./spacing.ts";

describe("reporter/summary-reporter/markup-printer/spacing", () => {
	describe("shouldAddEmptyLineBefore", () => {
		it("returns false for text elements", () => {
			const element = text("Hello");
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: false,
				isLastElement: false,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), false);
		});

		it("returns false for first element in normal context", () => {
			const element = paragraph("Hello");
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: true,
				isLastElement: false,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), false);
		});

		it("returns true for non-first paragraph in normal context", () => {
			const element = paragraph("Hello");
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: false,
				isLastElement: false,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), true);
		});

		it("returns false for first paragraph inside list item", () => {
			const element = paragraph("Hello");
			const context: PrintContext = {
				isInsideListItem: true,
				isFirstElement: true,
				isLastElement: false,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), false);
		});

		it("returns true for non-first paragraph inside list item", () => {
			const element = paragraph("Hello");
			const context: PrintContext = {
				isInsideListItem: true,
				isFirstElement: false,
				isLastElement: false,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), true);
		});

		it("returns true for non-first list inside list item", () => {
			const element = bulletList([listItem("Item")]);
			const context: PrintContext = {
				isInsideListItem: true,
				isFirstElement: false,
				isLastElement: false,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), true);
		});

		it("returns false for first list inside list item", () => {
			const element = bulletList([listItem("Item")]);
			const context: PrintContext = {
				isInsideListItem: true,
				isFirstElement: true,
				isLastElement: false,
			};
			strictEqual(shouldAddEmptyLineBefore(element, context), false);
		});
	});

	describe("shouldAddEmptyLineAfter", () => {
		it("returns false for text elements", () => {
			const element = text("Hello");
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: false,
				isLastElement: false,
			};
			strictEqual(shouldAddEmptyLineAfter(element, context), false);
		});

		it("returns false for paragraph in normal context", () => {
			const element = paragraph("Hello");
			const context: PrintContext = {
				isInsideListItem: false,
				isFirstElement: false,
				isLastElement: true,
			};
			strictEqual(shouldAddEmptyLineAfter(element, context), false);
		});

		it("returns false for non-last paragraph inside list item", () => {
			const element = paragraph("Hello");
			const context: PrintContext = {
				isInsideListItem: true,
				isFirstElement: false,
				isLastElement: false,
			};
			strictEqual(shouldAddEmptyLineAfter(element, context), false);
		});

		it("returns true for last paragraph inside list item", () => {
			const element = paragraph("Hello");
			const context: PrintContext = {
				isInsideListItem: true,
				isFirstElement: false,
				isLastElement: true,
			};
			strictEqual(shouldAddEmptyLineAfter(element, context), true);
		});

		it("returns false for list elements", () => {
			const element = bulletList([listItem("Item")]);
			const context: PrintContext = {
				isInsideListItem: true,
				isFirstElement: false,
				isLastElement: true,
			};
			strictEqual(shouldAddEmptyLineAfter(element, context), false);
		});
	});
});
