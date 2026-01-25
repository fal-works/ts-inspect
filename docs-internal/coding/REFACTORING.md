# Refactoring Guidelines

## Structure-level Refactoring

When moving code between modules:

- **Preserve implementation** of individual code blocks
- **Maintain existing documentation** comments unless logic/meaning changes

## General Changes

- **No backward compatibility** unless requested
- **Keep module dependencies simple** and explicit
- **Separate test modules** accordingly to maintain 1:1 correspondence when restructuring

## Dependency Guidelines

- **One-way dependencies** - Avoid circular references among packages
- **Suggest reorganizing** packages when dependencies become complex
- **Reduce complexity** of package dependency graph
