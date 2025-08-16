// Sample file with type assertions for testing exit code 1
export const data = { name: "test" };
export const anyValue = data as any;
export const stringValue = <string>data.name;
