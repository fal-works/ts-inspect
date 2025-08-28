# Architecture Overview

## Core Concept

This project is a **pluggable static analysis framework** built around the concept of sharing expensive operations.
Multiple custom analysis rules (inspectors) share a single AST traversal per file,
making it efficient to run many specialized checks without N× performance costs.

## Module Responsibility Boundaries

- **`inspector/`**: Central framework - abstraction of pluggable inspectors and execution engine
- **`diagnostics/`**: Diagnostic types and severity handling utilities
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
5. **Reporting**: Reporter functions format the diagnostic results for output
6. **Exit Code Determination**: Final exit code determined by worst severity among all findings

## Diagnostic System

The framework uses a structured diagnostic system. There are two diagnostic patterns:

### SimpleDiagnostics

The most common pattern, used when an inspector has a single message that applies to all findings.
Findings are organized by file, where each file contains an array of location-specific findings.

### RichDiagnostics

Used for complex analysis where each finding needs its own specific message.
This pattern supports three scopes of findings:

- **Project-level**: Issues that affect the entire codebase (architecture, dependencies, etc.)
- **File-level**: Issues that apply to an entire file (missing exports, file structure, etc.)  
- **Location-specific**: Issues tied to specific code locations (like most linting rules)
