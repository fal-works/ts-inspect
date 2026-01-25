# Core Concepts

## Core Concept

Pluggable static analysis framework sharing expensive operations.
Multiple inspectors share single AST traversal per file → no N× performance costs.

## Execution Flow

1. **Configuration**: Process tsconfig.json/jsconfig.json 
2. **Parsing**: Source files → TypeScript AST (parallel, non-blocking)
3. **Inspection**: Single AST traversal executes all inspectors per file
4. **Aggregation**: Each inspector processes accumulated state → diagnostic data
5. **Reporting**: Format diagnostic results for output
6. **Exit**: Determine exit code by worst severity

## Key Principles

- **Single traversal shared** - Add many inspectors without N× AST walks
- **Pluggable everything** - Custom inspectors, reporters, diagnostics
- **Structured diagnostics** - SimpleDiagnostics for common cases, RichDiagnostics for complex analysis
- **Modular API** - Import only what you need