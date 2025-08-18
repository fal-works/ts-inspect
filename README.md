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
- Customizable with a tiny API surface: define just a node visitor + a result builder.
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

### CLI Options

- `--project`, `-p` - Specify project directory or `tsconfig.json` path
- `--exclude-test` - Exclude files (e.g. `*.test.ts`) from parsing source files
- `--reporter` - Output format: `summary` (default, human-readable) or `raw-json` (machine-readable)
- `--output`, `-o` - Write output to file instead of stdout

### Exit Codes

The CLI uses standard exit codes to indicate different outcomes:

- Code `0`: Success - no issues found or only warnings
- Code `1`: Inspection error - found code quality issues that need to be fixed
- Code `2`: Fatal error - configuration problems, invalid arguments, or runtime errors

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

Write output to a custom stream:

```ts
import { createWriteStream } from "node:fs";
import { inspectProject } from "@fal-works/ts-inspect";

const outputStream = createWriteStream("results.txt", { encoding: "utf8" });
await inspectProject("./my-project", { output: outputStream });
outputStream.end();
```

## Built‑in Inspector: Suspicious Type Assertions

The default inspector flags potentially unnecessary or risky type assertions in both syntaxes (`as T` and `<T>expr`), excluding:

- `as const`
- `as unknown` and `<unknown>expr` (safe type narrowing)
- Assertions explicitly annotated with the inline comment `/* ignore-no-type-assertions */` either immediately before or after the node

Example error output:

```
Found suspicious type assertions:
❌  src/example.ts:42 - user as any
❌  src/example.ts:58 - <string>data

💡 Tip: (guidance message ...)
```

## Creating a Custom Inspector

An `Inspector<TState>` has three main components:

1. **`name`**: Identifier for the inspector (e.g., "console-log-inspector")
2. **`nodeInspectorFactory`**: Given a `ts.SourceFile`, returns a `NodeInspector` function called for each AST node in depth-first order. Accumulates state across nodes.
3. **`resultsBuilder`**: Processes all per-file accumulated state and returns structured diagnostic data as `InspectorResult`.

### Diagnostics

The framework supports several diagnostic types for different reporting scenarios:

- Location Diagnostic: File + line number + etc. (inspector provides global message)
- Module Diagnostic: File-level issues without specific line numbers
- Project Diagnostic: Project-wide issues (architecture, dependencies, etc.)

Each diagnostic has a severity that affects exit codes:

- **`"error"`**: Code quality issues that should be fixed (exit code 1)
- **`"warning"`**: Issues to review but don't cause failure (exit code 0)
- **`"info"`**: Informational notices (exit code 0)

### Example: Count `console.log` Calls

```ts
import {
  type CodeLocation,
  type Inspector,
  inspectProject,
  type LocationDiagnostic,
  translateSeverityToExitCode,
} from "@fal-works/ts-inspect";
import ts from "typescript";

function createConsoleLogInspector(): Inspector<CodeLocation[]> {
  return {
    name: "console-log-inspector",
    nodeInspectorFactory: (srcFile) => (node, recentState) => {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
        const expr = node.expression;
        if (expr.expression.getText(srcFile) === "console" && expr.name.text === "log") {
          const { line } = srcFile.getLineAndCharacterOfPosition(node.getStart(srcFile, false));
          const state = recentState ?? [];
          state.push({
            line: line + 1, // 1-based
            snippet: node.getText(srcFile),
          });
          return state;
        }
      }
      return undefined; // unchanged
    },
    resultsBuilder: (perFile) => {
      const items: LocationDiagnostic[] = [];
      let total = 0;

      for (const { srcFile, finalState } of perFile) {
        if (finalState && finalState.length > 0) {
          total += finalState.length;
          for (const finding of finalState) {
            items.push({
              type: "location",
              severity: "error",
              file: srcFile.file.fileName,
              location: finding,
            });
          }
        }
      }

      return {
        inspectorName: "console-log-inspector",
        message: total > 0 ? `Found ${total} console.log calls` : undefined,
        diagnostics: { type: "simple", items },
        advices:
          total > 0 ? "Consider using a proper logging library instead of console.log" : undefined,
      };
    },
  };
}

const status = await inspectProject(undefined, { inspectors: [createConsoleLogInspector()] });
process.exitCode = translateSeverityToExitCode(status);
```

## Reporters

`@fal-works/ts-inspect` supports different output formats through reporters.
You can select built-in reporters or create custom ones.

### Built-in Reporters

```ts
import { inspectProject, summaryReporter, rawJsonReporter } from "@fal-works/ts-inspect";

// Use the summary reporter (default - human-readable output)
await inspectProject("./my-project", { reporter: summaryReporter });

// Use the raw JSON reporter (machine-readable output)
await inspectProject("./my-project", { reporter: rawJsonReporter });
```

### Custom Reporters

Create your own reporter by implementing the `Reporter` interface:

```ts
import { inspectProject, type Reporter, translateSeverityToExitCode } from "@fal-works/ts-inspect";

const customReporter: Reporter = (results, output) => {
  // Write custom formatted output to the writable stream
  output.write(`Found ${results.length} inspector results\n`);

  for (const result of results) {
    if (result.diagnostics.items.length > 0) {
      output.write(`${result.inspectorName}: ${result.diagnostics.items.length} issues\n`);
    }
  }
};

const status = await inspectProject(undefined, { reporter: customReporter });
process.exitCode = translateSeverityToExitCode(status);
```
