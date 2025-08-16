import assert from "node:assert";
import { describe, it } from "node:test";
import { setHasValue } from "./utils.ts";

describe("core/utils", () => {
	describe("setHasValue", () => {
		it("returns true for values in the set", () => {
			const set = new Set(["a", "b", "c"]);
			assert.strictEqual(setHasValue(set, "a"), true);
			assert.strictEqual(setHasValue(set, "b"), true);
			assert.strictEqual(setHasValue(set, "c"), true);
		});

		it("returns false for values not in the set", () => {
			const set = new Set(["a", "b", "c"]);
			assert.strictEqual(setHasValue(set, "d"), false);
			assert.strictEqual(setHasValue(set, "x"), false);
		});

		it("handles different types correctly", () => {
			const numberSet = new Set([1, 2, 3]);
			assert.strictEqual(setHasValue(numberSet, 1), true);
			assert.strictEqual(setHasValue(numberSet, "1"), false);
			assert.strictEqual(setHasValue(numberSet, 4), false);
		});

		it("handles empty set", () => {
			const emptySet = new Set();
			assert.strictEqual(setHasValue(emptySet, "anything"), false);
		});

		it("provides correct type narrowing", () => {
			const set = new Set(["foo", "bar"] as const);
			const value: unknown = "foo";

			if (setHasValue(set, value)) {
				// TypeScript should narrow value to "foo" | "bar"
				const narrowed: "foo" | "bar" = value;
				assert.strictEqual(narrowed, "foo");
			}
		});
	});
});
