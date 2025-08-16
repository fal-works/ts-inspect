# @fal-works/ts-inspect

Auxiliary inspector / micro-linter for TypeScript and JavaScript projects.

Focus on niche or experimental code-quality heuristics you can't (or don't want to) put into your main linter.

## Status

Early alpha. Public API is small and may change.

## Why ts-inspect?

`@fal-works/ts-inspect` is a lightweight framework for running custom AST inspections using the TypeScript compiler API.

It complements full linters (Biome, ESLint, ...) when you need:

- A one-off rule that's too project-specific to justify a linter plugin.
- Fast prototyping of static analysis ideas.
- Guidance signals for AI coding agents (you control result formatting).
- Additional heuristics that run in CI without modifying existing linter configs.

It performs a single depth-first pass per source file and lets multiple inspectors share that traversal for efficiency.

## Key Features

- Single traversal shared by all inspectors (add many without N× AST walks).
- Uses TypeScript Compiler API for accurate parsing of TS / JS / TSX / JSX / etc.
- Ships with a default inspector: suspicious type assertions.
- Customizable with a tiny API surface: define just a node visitor + a result handler.
- Minimal runtime dependencies (TypeScript >= 5.0, Node.js >= 22.6).

## Installation

```bash
npm install --save-dev @fal-works/ts-inspect
# or
pnpm add -D @fal-works/ts-inspect
# or
yarn add -D @fal-works/ts-inspect
```

## Quick Start (CLI)

Run against the project in the current working directory (auto-detects `tsconfig.json`):

```bash
npx @fal-works/ts-inspect
```

Specify a different project directory or config file with `--project` (or `-p`):

```bash
npx @fal-works/ts-inspect -p ./my-project
npx @fal-works/ts-inspect -p ./custom-tsconfig.json
```

## Quick Start (Programmatic)

```ts
import { inspectProject } from "@fal-works/ts-inspect";

// Uses ./tsconfig.json by default
await inspectProject();

// Or specify a project directory containing tsconfig.json
await inspectProject("./my-project");

// Or specify a tsconfig.json file directly
await inspectProject("./my-project/tsconfig.json");
```

Or specify your own file list:

```ts
import { inspectFiles } from "@fal-works/ts-inspect";

await inspectFiles(["src/foo.ts", "src/bar.tsx"]);
```

## Built‑in Inspector: Suspicious Type Assertions

The default inspector flags potentially unnecessary or risky type assertions in both syntaxes (`as T` and `<T>expr`), excluding:

- `as const`
- `as unknown` and `<unknown>expr` (safe type narrowing)
- Assertions explicitly annotated with the inline comment `/* ignore-no-type-assertions */` either immediately before or after the node.

Example warning output:

```
Found suspicious type assertions:
⚠️  src/example.ts:42 - user as any
⚠️  src/example.ts:58 - <string>data

💡 Tip: (guidance message ...)
```

## Creating a Custom Inspector

An `Inspector<TResult>` has two parts:

1. `nodeInspectorFactory`: given a `ts.SourceFile`, returns a `NodeInspector` (a function called for each node in depth-first order). It can accumulate a result across nodes.
2. `resultsHandler`: receives all non-null per-file results and returns an `InspectionStatus` (`"success" | "warn" | "error"`).

### Example: Count `console.log` Calls

```ts
import ts from "typescript";
import { type Inspector, inspectProject } from "@fal-works/ts-inspect";

function createConsoleLogInspector(): Inspector<number> {
  return {
    nodeInspectorFactory: (sf) => (node, count) => {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
        const expr = node.expression;
        if (expr.expression.getText(sf) === "console" && expr.name.text === "log") {
          return (count ?? 0) + 1;
        }
      }
      return undefined; // unchanged
    },
    resultsHandler: (perFile) => {
      if (!perFile.length) return "success";
      let total = 0;
      for (const { srcFile, result } of perFile) {
        if (result > 0) {
          total += result;
          console.warn(`${srcFile.file.fileName}: ${result} console.log calls`);
        }
      }
      if (total === 0) return "success";
      console.warn(`Total console.log calls: ${total}`);
      return "warn";
    }
  };
}

await inspectProject(undefined, { inspectors: [createConsoleLogInspector()] });
```
