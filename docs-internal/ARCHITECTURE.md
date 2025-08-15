# Architecture Overview

## Core Concept

This project is a **pluggable static analysis framework** built around the concept of sharing expensive operations.
Multiple custom analysis rules (inspectors) share a single AST traversal per file,
making it efficient to run many specialized checks without N× performance costs.

## Module Responsibility Boundaries

- **`inspector/`**: Central framework - abstraction of pluggable inspectors, and execution engine
- **`source-file/`**: TypeScript Compiler API abstraction layer for source file parsing
- **`tsconfig/`**: tsconfig resolution and parsing
- **`preset-inspectors/`**: Concrete inspector implementations
- **`core/`**: Shared utilities and types
- **Entry points**: `index.ts` (API) and `bin.ts` (CLI) - thin orchestration layer

## Execution Flow

1. **Configuration Resolution**: Process tsconfig.json/jsconfig.json if project-based inspection
2. **Concurrent Parsing**: Source files parsed to TypeScript AST in parallel (non-blocking)
3. **Per-File Inspection**: Single AST traversal executes all inspectors per file, each inspector accumulating its own results
4. **Per-Inspector Aggregation**: Each inspector's `ResultsHandler` independently processes accumulated results of all files
5. **Status Determination**: Final status = worst status among all inspector results
