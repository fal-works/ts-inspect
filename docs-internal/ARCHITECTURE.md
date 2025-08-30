# Architecture Overview

## Core Concept

This project is a **pluggable static analysis framework** built around the concept of sharing expensive operations.
Multiple custom analysis rules (inspectors) share a single AST traversal per file,
making it efficient to run many specialized checks without N× performance costs.

## Module Organization

### Core Framework Modules

- **`inspector/`**: Core inspection framework - pluggable inspector abstraction and execution engine
- **`diagnostics/`**: Diagnostic data structures and severity handling
  - **`diagnostics/markup/`**: Structured markup builders for rich diagnostic formatting
- **`reporter/`**: Output formatting layer with pluggable reporter system
  - **`reporter/printer/`**: Low-level text and XML printing utilities
- **`error/`**: Error handling foundation used across all modules

### Application Layer

- **`main/orchestrator/`**: Execution flow, options processing, and configuration management
- **`main/builtin-inspectors/`**: Default inspector implementations
- **`main/builtin-reporters/`**: Default reporter implementations
- **`index.ts`**: Main API exports
- **`bin.ts`**: CLI entry point

### Foundation

- **`internal/`**: Pure utility modules with no external dependencies
  - **`internal/utils/`**: Micellaneous utilities

## Public API Entry Points

The library provides modular entry points:

- **`.`**: Main inspection functions, built-in inspectors, and reporters
- **`./inspector`**: Types and utilities for creating custom inspectors
- **`./diagnostics`**: Diagnostic data structures and severity utilities
- **`./diagnostics/markup`**: Rich diagnostic content builders
- **`./reporter`**: Reporter interface and printing utilities
- **`./error`**: Error types and handling

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