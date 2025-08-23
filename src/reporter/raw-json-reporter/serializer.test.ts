import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toSerializable } from "./serializer.ts";

describe("reporter/raw-json-reporter/serializer", () => {
	describe("toSerializable", () => {
		it("returns primitive values unchanged", () => {
			assert.equal(toSerializable(42), 42);
			assert.equal(toSerializable("hello"), "hello");
			assert.equal(toSerializable(true), true);
			assert.equal(toSerializable(false), false);
			assert.equal(toSerializable(null), null);
			assert.equal(toSerializable(undefined), undefined);
		});

		it("converts Map to plain object", () => {
			const map = new Map([
				["key1", "value1"],
				["key2", "value2"],
			]);
			const result = toSerializable(map);
			assert.deepEqual(result, {
				key1: "value1",
				key2: "value2",
			});
		});

		it("converts nested Maps to plain objects", () => {
			const innerMap = new Map([["inner", "value"]]);
			const outerMap = new Map<string, any>([
				["outer", innerMap],
				["simple", "text"],
			]);
			const result = toSerializable(outerMap);
			assert.deepEqual(result, {
				outer: { inner: "value" },
				simple: "text",
			});
		});

		it("processes arrays recursively", () => {
			const map = new Map([["key", "value"]]);
			const array = [1, "text", map, [2, 3]];
			const result = toSerializable(array);
			assert.deepEqual(result, [1, "text", { key: "value" }, [2, 3]]);
		});

		it("processes plain objects recursively", () => {
			const map = new Map([["mapKey", "mapValue"]]);
			const obj = {
				string: "text",
				number: 42,
				nested: {
					map: map,
					array: [1, 2],
				},
			};
			const result = toSerializable(obj);
			assert.deepEqual(result, {
				string: "text",
				number: 42,
				nested: {
					map: { mapKey: "mapValue" },
					array: [1, 2],
				},
			});
		});

		it("handles empty Maps", () => {
			const map = new Map();
			const result = toSerializable(map);
			assert.deepEqual(result, {});
		});

		it("handles empty arrays", () => {
			const result = toSerializable([]);
			assert.deepEqual(result, []);
		});

		it("handles empty objects", () => {
			const result = toSerializable({});
			assert.deepEqual(result, {});
		});

		it("handles complex nested structures", () => {
			const complexStructure = {
				maps: [
					new Map([
						["a", 1],
						["b", 2],
					]),
					new Map([["c", { nested: new Map([["d", 4]]) }]]),
				],
				mixed: {
					array: [new Map([["e", 5]]), { plain: "object" }],
				},
			};
			const result = toSerializable(complexStructure);
			assert.deepEqual(result, {
				maps: [{ a: 1, b: 2 }, { c: { nested: { d: 4 } } }],
				mixed: {
					array: [{ e: 5 }, { plain: "object" }],
				},
			});
		});

		it("preserves object property order", () => {
			const obj = { z: 1, a: 2, m: 3 };
			const result = toSerializable(obj) as Record<string, unknown>;
			const keys = Object.keys(result);
			assert.deepEqual(keys, ["z", "a", "m"]);
		});

		it("handles objects with symbol properties", () => {
			const sym = Symbol("test");
			const obj = {
				regular: "value",
				[sym]: "symbol-value",
			};
			const result = toSerializable(obj);
			// Symbol properties are not enumerable by Object.entries
			assert.deepEqual(result, { regular: "value" });
		});

		it("handles objects with non-enumerable properties", () => {
			const obj = {};
			Object.defineProperty(obj, "hidden", {
				value: "secret",
				enumerable: false,
			});
			Object.defineProperty(obj, "visible", {
				value: "public",
				enumerable: true,
			});
			const result = toSerializable(obj);
			// Non-enumerable properties are not included by Object.entries
			assert.deepEqual(result, { visible: "public" });
		});

		it("handles Map with non-string keys", () => {
			const map = new Map<unknown, unknown>([
				[1, "number-key"],
				[true, "boolean-key"],
				[{ obj: "key" }, "object-key"],
			]);
			const result = toSerializable(map) as Record<string, unknown>;
			// Map keys are converted to strings when creating the object
			assert.equal(result["1"], "number-key");
			assert.equal(result.true, "boolean-key");
			assert.equal(result["[object Object]"], "object-key");
		});

		it("throws on circular references", () => {
			const obj: any = { a: 1 };
			obj.circular = obj;

			// Our serializer throws RangeError on circular references due to infinite recursion
			assert.throws(
				() => {
					toSerializable(obj);
				},
				{
					name: "RangeError",
					message: /Maximum call stack size exceeded/,
				},
			);
		});
	});
});
