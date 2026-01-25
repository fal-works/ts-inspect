# Diagnostics System

Framework uses structured diagnostic system with two patterns:

## SimpleDiagnostics

**Use for**: Single message applies to all findings

**Structure**: Findings organized by file → array of location-specific findings per file

**Example**: Type assertion inspector with consistent "suspicious assertion" message

## RichDiagnostics

**Use for**: Complex analysis where each finding needs specific message

**Three scopes**:
- **Project-level** - Entire codebase issues (architecture, dependencies)
- **File-level** - Entire file issues (missing exports, file structure)  
- **Location-specific** - Code location issues (most linting rules)

## Severity Levels

- **error** - Must fix (contributes to exit code 1)
- **warning** - Should review (exit code 0)
- **info** - Optional guidance (exit code 0)

## Exit Code Mapping

- Code 0: Success (no issues or warnings only)
- Code 1: Issues found (errors present)  
- Code 2: Fatal error (config problems, runtime errors)