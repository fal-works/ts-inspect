/**
 * Asserts that the second type extends the first type.
 * @example assertExtends<Base, Derived>();
 * @internal
 */
export function assertExtends<Super, Sub extends Super>(_?: Sub): void {
	// No runtime logic needed; this function is for compile-time type checking only.
}
