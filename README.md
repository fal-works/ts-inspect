# @fal-works/ts-inspect

Auxiliary inspector / micro-linter for TypeScript and JavaScript projects.

Focus on niche or experimental code-quality heuristics you can't (or don't want to) put into your main linter.

## Status

Early alpha. Public API is small and may change.

## You Might Want to Consider Other Tools

- [Biome](https://biomejs.dev/) now supports [Linter Plugins](https://biomejs.dev/linter/plugins/).
- [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) now offers [type-aware linting](https://oxc.rs/blog/2025-08-17-oxlint-type-aware).
- [ESLint](https://eslint.org/) ecosystem has one of the largest collections of plugins and rules.
- [ast-grep](https://ast-grep.github.io/) provides AST-based code search and linting for multiple languages, including TS.

## Why ts-inspect?

`@fal-works/ts-inspect` is a lightweight framework for custom AST inspections using the TypeScript compiler API.

It complements full linters (Biome, ESLint, ...) when you need:

- Fast prototyping of type-aware inspections, leveraging TypeScript’s AST parsing.
- Guidance signals for AI coding agents, with customizable result formatting.
- Project-specific or experimental code-quality heuristics that don’t fit into mainstream linters.

## Key Features

- Single traversal shared by all inspectors (add many without N× AST walks).
- Uses TypeScript Compiler API for accurate parsing of TS / JS / TSX / JSX / etc.
- Ships with a default inspector: suspicious type assertions.
- Customizable with a tiny API surface: define just a node visitor + a result builder.
- Accepts custom reporters for flexible output formatting, fully decoupled from individual inspectors.
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

(instruction message ...)
```

## Creating a Custom Inspector

An `Inspector<TState>` has three main components:

1. **`name`**: Identifier for the inspector (e.g., "console-log-inspector")
2. **`nodeInspectorFactory`**: Given a `ts.SourceFile`, returns a `NodeInspector` function called for each AST node in depth-first order. Accumulates state across nodes.
3. **`resultsBuilder`**: Processes all per-file accumulated state and returns structured diagnostic data as `InspectorResult`.

### Diagnostic System

The framework uses a structured diagnostic system. There are two diagnostic patterns:

#### SimpleDiagnostics

The most common pattern, used when an inspector has a single message that applies to all findings.

Findings are organized by file, where each file contains an array of location-specific findings.

#### RichDiagnostics

Used for complex analysis where each finding needs its own specific message.

This pattern supports three scopes of findings:

- **Project-level**: Issues that affect the entire codebase (architecture, dependencies, etc.)
- **File-level**: Issues that apply to an entire file (missing exports, file structure, etc.)  
- **Location-specific**: Issues tied to specific code locations (like most linting rules)

### Example: Count `console.log` Calls

```ts
import {
  type CodeLocation,
  type DiagnosticDetails,
  type Inspector,
  inspectProject,
  type SimpleDiagnostics,
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
      const perFileMap: SimpleDiagnostics["perFile"] = new Map();
      let totalFindings = 0;

      for (const r of perFile) {
        const findings = r.finalState;
        if (findings.length > 0) {
          const file = r.srcFile.file.fileName;
          perFileMap.set(file, {
            locations: findings.map((found) => [found, { severity: "error" }]),
          });
          totalFindings += findings.length;
        }
      }

      const details: DiagnosticDetails =
        totalFindings > 0
          ? {
              message: `Found ${totalFindings} console.log calls.`,
              instructions: "Consider using a proper logging library instead of console.log",
            }
          : {
              message: "No console.log calls found.",
            };

      const diagnostics: SimpleDiagnostics = {
        type: "simple",
        details,
        perFile: perFileMap,
      };

      return {
        inspectorName: "console-log-inspector",
        diagnostics,
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
  output.write(`Found ${results.length} inspector results\n`);

  for (const result of results) {
    const { diagnostics } = result;
    let findingsCount = 0;

    if (diagnostics.type === "simple") {
      for (const fileScope of diagnostics.perFile.values()) {
        findingsCount += fileScope.locations.length;
      }
    } else if (diagnostics.type === "rich") {
      findingsCount += diagnostics.project.length;
      for (const fileScope of diagnostics.perFile.values()) {
        findingsCount += fileScope.wholeFile.length + fileScope.locations.length;
      }
    }

    if (findingsCount > 0) {
      output.write(`${result.inspectorName}: ${findingsCount} findings\n`);
    }
  }
};

const status = await inspectProject(undefined, { reporter: customReporter });
process.exitCode = translateSeverityToExitCode(status);
```
