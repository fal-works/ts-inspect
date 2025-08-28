/**
 * Unit tests for XML string utilities.
 */

import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { escapeXmlAttribute, escapeXmlText, objectToXmlAttributesString } from "./xml-string.ts";

describe("internal/utils/xml-string", () => {
	describe("escapeXmlText", () => {
		test("escapes XML special characters in text", () => {
			assert.equal(escapeXmlText("Hello & <world>"), "Hello &amp; &lt;world&gt;");
		});

		test("leaves normal text unchanged", () => {
			assert.equal(escapeXmlText("Hello world"), "Hello world");
		});

		test("escapes all ampersands", () => {
			assert.equal(escapeXmlText("A & B & C"), "A &amp; B &amp; C");
		});

		test("escapes all less-than signs", () => {
			assert.equal(escapeXmlText("A < B < C"), "A &lt; B &lt; C");
		});

		test("escapes all greater-than signs", () => {
			assert.equal(escapeXmlText("A > B > C"), "A &gt; B &gt; C");
		});

		test("handles empty string", () => {
			assert.equal(escapeXmlText(""), "");
		});

		test("handles mixed special characters", () => {
			assert.equal(
				escapeXmlText("<tag>content & more</tag>"),
				"&lt;tag&gt;content &amp; more&lt;/tag&gt;",
			);
		});
	});

	describe("escapeXmlAttribute", () => {
		test("escapes XML special characters and quotes", () => {
			assert.equal(
				escapeXmlAttribute("Hello & <world> \"test\" 'quote'"),
				"Hello &amp; &lt;world&gt; &quot;test&quot; &apos;quote&apos;",
			);
		});

		test("leaves normal text unchanged", () => {
			assert.equal(escapeXmlAttribute("Hello world"), "Hello world");
		});

		test("escapes double quotes", () => {
			assert.equal(escapeXmlAttribute('Say "hello"'), "Say &quot;hello&quot;");
		});

		test("escapes single quotes", () => {
			assert.equal(escapeXmlAttribute("Say 'hello'"), "Say &apos;hello&apos;");
		});

		test("handles empty string", () => {
			assert.equal(escapeXmlAttribute(""), "");
		});

		test("escapes all required characters", () => {
			assert.equal(escapeXmlAttribute("&<>\"'"), "&amp;&lt;&gt;&quot;&apos;");
		});
	});

	describe("objectToXmlAttributesString", () => {
		test("formats attributes with string values", () => {
			const result = objectToXmlAttributesString({ name: "test", value: "hello" });
			assert.equal(result, 'name="test" value="hello"');
		});

		test("formats attributes with number values", () => {
			const result = objectToXmlAttributesString({ line: 42, column: 10 });
			assert.equal(result, 'line="42" column="10"');
		});

		test("skips undefined attributes", () => {
			const result = objectToXmlAttributesString({ name: "test", value: undefined });
			assert.equal(result, 'name="test"');
		});

		test("returns empty string for no attributes", () => {
			const result = objectToXmlAttributesString({});
			assert.equal(result, "");
		});

		test("returns empty string when all attributes are undefined", () => {
			const result = objectToXmlAttributesString({ name: undefined, value: undefined });
			assert.equal(result, "");
		});

		test("escapes attribute values", () => {
			const result = objectToXmlAttributesString({ message: 'Hello "world"' });
			assert.equal(result, 'message="Hello &quot;world&quot;"');
		});

		test("handles mixed attribute types", () => {
			const result = objectToXmlAttributesString({
				name: "test",
				line: 42,
				message: "Hello & world",
				skip: undefined,
			});
			assert.equal(result, 'name="test" line="42" message="Hello &amp; world"');
		});

		test("handles zero as valid number value", () => {
			const result = objectToXmlAttributesString({ line: 0, column: 0 });
			assert.equal(result, 'line="0" column="0"');
		});

		test("handles special characters in attribute values", () => {
			const result = objectToXmlAttributesString({ content: "<tag>content & 'more'</tag>" });
			assert.equal(result, 'content="&lt;tag&gt;content &amp; &apos;more&apos;&lt;/tag&gt;"');
		});
	});
});
