import { defineConfig } from "tsdown";

export default defineConfig([
	{
		entry: [
			"src/index.ts",
			"src/diagnostics/index.ts",
			"src/diagnostics/markup/index.ts",
			"src/inspector/index.ts",
			"src/reporter/index.ts",
		],
		outDir: "dist",
		platform: "node",
		target: ["node22", "es2022"],
		dts: true,
		sourcemap: true,
		unbundle: true,
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
