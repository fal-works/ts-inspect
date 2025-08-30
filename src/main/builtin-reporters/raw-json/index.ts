/**
 * Raw JSON reporter that outputs inspection results as JSON without any conversion.
 */

import type { Reporter } from "../../../reporter/reporter.ts";
import { toSerializable } from "./serializer.ts";

/**
 * Creates a raw JSON reporter that outputs inspection results as JSON with minimum conversion.
 */
export function createRawJsonReporter(): Reporter {
	return (results, output) => {
		// Convert any Maps to objects for JSON serialization
		const serializable = toSerializable(results);
		output.write(JSON.stringify(serializable));
	};
}
