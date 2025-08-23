/**
 * Raw JSON reporter that outputs inspection results as JSON without any conversion.
 */

import type { Reporter } from "./reporter.ts";

/**
 * Converts a value to a JSON-serializable format, handling Map instances.
 */
function toSerializable(value: unknown): unknown {
	if (value instanceof Map) {
		// Convert Map to object
		const obj: Record<string, unknown> = {};
		for (const [k, v] of value) {
			obj[k] = toSerializable(v);
		}
		return obj;
	} else if (Array.isArray(value)) {
		return value.map(toSerializable);
	} else if (value !== null && typeof value === "object") {
		const obj: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value)) {
			obj[k] = toSerializable(v);
		}
		return obj;
	}
	return value;
}

/**
 * Built-in reporter that outputs inspection results as JSON without any conversion.
 */
export const rawJsonReporter: Reporter = (results, output) => {
	// Convert any Maps to objects for JSON serialization
	const serializable = toSerializable(results);
	output.write(JSON.stringify(serializable));
};
