// Test file with console.log calls for testing custom inspector
export function debugFunction(value: unknown) {
	console.log("Debug:", value);
	console.log("Processing...");
	return value;
}

export function regularFunction() {
	console.error("This is not a console.log");
	console.warn("This is also not a console.log");
	return "done";
}
