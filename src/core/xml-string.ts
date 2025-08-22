/**
 * XML string utilities for escaping and formatting XML content.
 */

/**
 * Escapes text content for safe inclusion in XML text nodes.
 */
export function escapeXmlText(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Escapes attribute values for safe inclusion in XML attributes.
 */
export function escapeXmlAttribute(value: string): string {
	return escapeXmlText(value).replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/**
 * Formats XML attributes from an object.
 */
export function objectToXmlAttributesString(
	attributes: Record<string, string | number | undefined>,
): string {
	const parts: string[] = [];

	for (const [key, value] of Object.entries(attributes)) {
		if (value !== undefined) {
			parts.push(`${key}="${escapeXmlAttribute(String(value))}"`);
		}
	}

	return parts.join(" ");
}
