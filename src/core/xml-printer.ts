/**
 * XML-specific printer utilities for building well-formed XML output.
 */

import type { Writable } from "node:stream";
import {
	createPrinter as createBasePrinter,
	type Printer,
	type PrinterOptions,
} from "./printer.ts";
import { objectToXmlAttributesString } from "./xml-string.ts";

/**
 * XML printer interface that extends the base printer with XML-specific methods.
 */
export interface XmlPrinter extends Printer {
	/**
	 * Prints XML declaration.
	 */
	printXmlDeclaration(): void;

	/**
	 * Prints an XML element opening tag with attributes.
	 */
	printXmlElementStart(
		tagName: string,
		attributes?: Record<string, string | number | undefined>,
	): void;

	/**
	 * Prints an XML element closing tag.
	 */
	printXmlElementEnd(tagName: string): void;

	/**
	 * Prints a self-closing XML element with attributes.
	 */
	printXmlSelfClosingElement(
		tagName: string,
		attributes?: Record<string, string | number | undefined>,
		spaceAtEnd?: boolean,
	): void;
}

/**
 * @see XmlPrinter.printXmlDeclaration
 */
function printXmlDeclaration(printer: Printer): void {
	printer.println('<?xml version="1.0" encoding="UTF-8"?>');
}

/**
 * @see XmlPrinter.printXmlElementStart
 */
function printXmlElementStart(
	printer: Printer,
	tagName: string,
	attributes: Record<string, string | number | undefined> = {},
): void {
	const attributeString = objectToXmlAttributesString(attributes);
	printer.print(`<${tagName}${attributeString ? ` ${attributeString}` : ""}>`);
}

/**
 * @see XmlPrinter.printXmlElementEnd
 */
function printXmlElementEnd(printer: Printer, tagName: string): void {
	printer.print(`</${tagName}>`);
}

/**
 * @see XmlPrinter.printXmlSelfClosingElement
 */
function printXmlSelfClosingElement(
	printer: Printer,
	tagName: string,
	attributes: Record<string, string | number | undefined> = {},
	spaceAtEnd = false,
): void {
	const attributeString = objectToXmlAttributesString(attributes);
	const endSlash = spaceAtEnd ? " />" : "/>";
	printer.print(`<${tagName}${attributeString ? ` ${attributeString}` : ""}${endSlash}`);
}

/**
 * Creates an XML printer instance that extends the base printer with XML-specific methods.
 *
 * @param output - The stream to write formatted text to, e.g. `process.stdout`.
 * @param options - Optional configuration for the printer.
 */
export function createXmlPrinter(output: Writable, options?: PrinterOptions): XmlPrinter {
	const basePrinter = createBasePrinter(output, options);

	return {
		...basePrinter,
		printXmlDeclaration: printXmlDeclaration.bind(null, basePrinter),
		printXmlElementStart: printXmlElementStart.bind(null, basePrinter),
		printXmlElementEnd: printXmlElementEnd.bind(null, basePrinter),
		printXmlSelfClosingElement: printXmlSelfClosingElement.bind(null, basePrinter),
	};
}
