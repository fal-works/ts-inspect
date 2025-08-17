# Architecture Overview

## Core Concept

This project is a **pluggable static analysis framework** built around the concept of sharing expensive operations.
Multiple custom analysis rules (inspectors) share a single AST traversal per file,
making it efficient to run many specialized checks without N× performance costs.

## Module Responsibility Boundaries

- **`inspector/`**: Central framework - abstraction of pluggable inspectors, diagnostic types, and execution engine
- **`reporter/`**: Output formatting and presentation layer (console, JSON, etc.)
- **`source-file/`**: TypeScript Compiler API abstraction layer for source file parsing
- **`tsconfig/`**: tsconfig resolution and parsing
- **`builtin-inspectors/`**: Concrete inspector implementations
- **`core/`**: Shared utilities and types (should not depend on any other modules in this project)
- **Entry points**: `index.ts` (API) and `bin.ts` (CLI) - thin orchestration layer

## Execution Flow

1. **Configuration Resolution**: Process tsconfig.json/jsconfig.json if project-based inspection
2. **Concurrent Parsing**: Source files parsed to TypeScript AST in parallel (non-blocking)
3. **Per-File Inspection**: Single AST traversal executes all inspectors per file, each inspector accumulating its own state
4. **Per-Inspector Aggregation**: Each inspector's `ResultsBuilder` independently processes accumulated state of all files into structured diagnostic data
5. **Reporting**: Reporter functions format the diagnostic results for output (console, JSON, etc.)
6. **Exit Code Determination**: Final exit code determined by worst severity among all diagnostic results

## Diagnostic System

The framework uses a structured diagnostic system with several main types, such as:

- **`LocationDiagnostic`**: File + line + snippet (inspector provides global message/advice)
- **`ModuleDiagnostic`**: File-level issues without specific line numbers
- **`ProjectDiagnostic`**: Project-wide issues (architecture, dependencies, etc.)

Each diagnostic has a severity (`error`, `warning`, `info`) that determines the final exit code:
- `error` diagnostics → exit code 1
- `warning`/`info` diagnostics → exit code 0
