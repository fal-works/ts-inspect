# Design Patterns

## Type System Patterns

- **Sum types for finite states**: `type Choice = "a" | "b"`
- **Make illegal states unrepresentable** - use types to eliminate invalid states

## Function Design

- **Function cohesion** - single responsibilities first, then compose
- **Stateless over stateful** - prefer pure functions
- **Immutability over mutability** - minimize side effects

## Architecture Patterns

- **Simple dependencies** - one-way, avoid circular references
- **Reduce complexity** of package dependency graph
- **Modular organization** - group related functionality into packages
