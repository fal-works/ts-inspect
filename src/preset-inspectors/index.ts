import { createAsAssertionInspector } from "./as-assertions.ts";

export function createDefaultInspectors() {
  return [createAsAssertionInspector()];
}

export { createAsAssertionInspector };