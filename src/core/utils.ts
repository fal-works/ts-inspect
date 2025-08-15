/**
 * @returns `true` if the value is in the set, `false` otherwise.
 */
export function setHasValue<T>(set: ReadonlySet<T>, value: unknown): value is T {
	return set.has(value as T /* UNAVOIDABLE_AS */);
}
