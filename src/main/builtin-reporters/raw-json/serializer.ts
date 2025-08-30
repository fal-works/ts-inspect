/**
 * Utilities for converting values to JSON-serializable format.
 */

/**
 * Converts a value to a JSON-serializable format, handling Map instances.
 */
export function toSerializable(value: unknown): unknown {
	if (value instanceof Map) {
		return Object.fromEntries(Array.from(value, ([k, v]) => [k, toSerializable(v)]));
	} else if (Array.isArray(value)) {
		return value.map(toSerializable);
	} else if (value !== null && typeof value === "object") {
		return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toSerializable(v)]));
	}
	return value;
}
