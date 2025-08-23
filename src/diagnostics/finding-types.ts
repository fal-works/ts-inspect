/**
 * Core finding types for diagnostic content.
 */

import type { DiagnosticSeverity } from "./common-types.ts";

/**
 * Basic finding with severity level.
 * Used in simple diagnostics where the inspector provides a global message.
 */
export interface Finding {
	severity: DiagnosticSeverity;
}

/**
 * Finding with individual message and advice.
 * Used in rich diagnostics where each finding has its own explanation.
 */
export interface DetailedFinding extends Finding {
	message: string;
	advices?: string;
}
