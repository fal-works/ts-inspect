#!/usr/bin/env node

import { inspectWithTsconfig } from "./index.ts";

async function main() {
	await inspectWithTsconfig();
}

await main();
