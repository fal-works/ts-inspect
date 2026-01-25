# Module Organization

## Core Framework

- **`inspector/`** - Pluggable inspector abstraction and execution engine
- **`diagnostics/`** - Diagnostic data structures and severity handling
  - **`diagnostics/markup/`** - Structured markup builders for rich formatting
- **`reporter/`** - Output formatting with pluggable reporter system
  - **`reporter/printer/`** - Low-level text and XML printing utilities  
- **`error/`** - Error handling foundation

## Application Layer

- **`main/orchestrator/`** - Execution flow, options, configuration
- **`main/builtin-inspectors/`** - Default inspector implementations
- **`main/builtin-reporters/`** - Default reporter implementations
- **`index.ts`** - Main API exports
- **`bin.ts`** - CLI entry point

## Foundation

- **`internal/`** - Pure utility modules (no external dependencies)
  - **`internal/utils/`** - Miscellaneous utilities

## Public API Entry Points

- **`.`** - Main inspection functions, built-in inspectors/reporters
- **`./inspector`** - Types/utilities for custom inspectors
- **`./diagnostics`** - Diagnostic data structures, severity utilities
- **`./diagnostics/markup`** - Rich diagnostic content builders
- **`./reporter`** - Reporter interface, printing utilities
- **`./error`** - Error types and handling