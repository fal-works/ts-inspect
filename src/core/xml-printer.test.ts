/**
 * Unit tests for XML printer utilities.
 */

import assert from "node:assert/strict";
import { Writable } from "node:stream";
import { describe, it, test } from "node:test";
import type { PrinterOptions } from "./printer.ts";
import { createXmlPrinter } from "./xml-printer.ts";

describe("core/xml-printer", () => {
	describe("createXmlPrinter", () => {
		test("returns XmlPrinter with all required methods", () => {
			const stream = new Writable({
				write(_chunk, _encoding, callback) {
					callback();
				},
			});

			const printer = createXmlPrinter(stream);

			// Check that it has base Printer methods
			assert.equal(typeof printer.print, "function");
			assert.equal(typeof printer.println, "function");
			assert.equal(typeof printer.newLine, "function");
			assert.equal(typeof printer.group, "function");
			assert.equal(typeof printer.groupEnd, "function");

			// Check that it has XML-specific methods
			assert.equal(typeof printer.printXmlDeclaration, "function");
			assert.equal(typeof printer.printXmlElementStart, "function");
			assert.equal(typeof printer.printXmlElementEnd, "function");
			assert.equal(typeof printer.printXmlSelfClosingElement, "function");
		});
	});

	describe("type XmlPrinter", () => {
		function captureOutput(fn: (printer: ReturnType<typeof createXmlPrinter>) => void): string {
			let output = "";
			const stream = new Writable({
				write(chunk, _encoding, callback) {
					output += chunk.toString();
					callback();
				},
			});

			const printer = createXmlPrinter(stream);
			fn(printer);
			return output;
		}

		describe("printXmlDeclaration", () => {
			test("prints XML declaration", () => {
				const output = captureOutput((printer) => printer.printXmlDeclaration());
				assert.equal(output, '<?xml version="1.0" encoding="UTF-8"?>\n');
			});
		});

		describe("printXmlElementStart", () => {
			test("prints opening tag without attributes", () => {
				const output = captureOutput((printer) => printer.printXmlElementStart("test"));
				assert.equal(output, "<test>");
			});

			test("prints opening tag with attributes", () => {
				const output = captureOutput((printer) =>
					printer.printXmlElementStart("test", { name: "value", line: 42 }),
				);
				assert.equal(output, '<test name="value" line="42">');
			});
		});

		describe("printXmlElementEnd", () => {
			test("prints closing tag", () => {
				const output = captureOutput((printer) => printer.printXmlElementEnd("test"));
				assert.equal(output, "</test>");
			});
		});

		describe("printXmlSelfClosingElement", () => {
			test("prints self-closing tag without attributes", () => {
				const output = captureOutput((printer) => printer.printXmlSelfClosingElement("test"));
				assert.equal(output, "<test/>");
			});

			test("prints self-closing tag with attributes", () => {
				const output = captureOutput((printer) =>
					printer.printXmlSelfClosingElement("test", { name: "value", line: 42 }),
				);
				assert.equal(output, '<test name="value" line="42"/>');
			});

			test("prints self-closing tag without attributes with spaceAtEnd", () => {
				const output = captureOutput((printer) =>
					printer.printXmlSelfClosingElement("br", {}, true),
				);
				assert.equal(output, "<br />");
			});

			test("prints self-closing tag with attributes with spaceAtEnd", () => {
				const output = captureOutput((printer) =>
					printer.printXmlSelfClosingElement("img", { src: "test.jpg", alt: "test" }, true),
				);
				assert.equal(output, '<img src="test.jpg" alt="test" />');
			});

			test("prints self-closing tag with spaceAtEnd=false (explicit)", () => {
				const output = captureOutput((printer) =>
					printer.printXmlSelfClosingElement("test", {}, false),
				);
				assert.equal(output, "<test/>");
			});
		});
	});

	describe("createXmlPrinter with options", () => {
		function captureOutputWithOptions(
			options: PrinterOptions,
			fn: (printer: ReturnType<typeof createXmlPrinter>) => void,
		): string {
			let output = "";
			const stream = new Writable({
				write(chunk, _encoding, callback) {
					output += chunk.toString();
					callback();
				},
			});

			const printer = createXmlPrinter(stream, options);
			fn(printer);
			return output;
		}

		it("uses custom indentUnit for XML elements", () => {
			const output = captureOutputWithOptions({ indentUnit: "\t" }, (printer) => {
				printer.group("XML:");
				printer.printXmlElementStart("root");
				printer.newLine();
				printer.printXmlElementStart("child");
				printer.print("content");
				printer.printXmlElementEnd("child");
				printer.newLine();
				printer.printXmlElementEnd("root");
				printer.groupEnd();
			});
			assert.equal(output, "XML:\n\t<root>\n\t<child>content</child>\n\t</root>\n");
		});
	});
});
