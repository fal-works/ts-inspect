import { defineConfig } from "tsdown";

export default defineConfig([
	{
		entry: { index: "src/index.ts" },
		outDir: "dist",
		platform: "node",
		target: ["node22", "es2022"],
		dts: true,
		sourcemap: true,
		tsconfig: "config/tsconfig-build.json",
	},
	{
		entry: { bin: "src/bin.ts" },
		outDir: "dist",
		platform: "node",
		target: ["node22", "es2022"],
		dts: false,
		minify: true,
		tsconfig: "config/tsconfig-build.json",
	},
]);
