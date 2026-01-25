# Module Separation

## Problem

Keep functions small and testable without:
- Private functions inaccessible to tests
- Over-exported APIs complicating dependencies
- Monolithic modules

## @package Pattern

Functions needing test access but not public export:

```typescript
/**
 * @package - Internal to package, testable
 */
export function validateConfig(config: unknown): Config {
  // implementation
}
```

## Package Organization

Group related modules in subdirectories:

```
diagnostics/
  index.ts       // Public exports only
  builder.ts     // @package functions
  formatter.ts   // @package functions
```

## Access Rules

- Modules within package can import each other
- External packages import only through `index.ts`
- `@package` functions accessible within package boundary

## Result

Clean module dependency + testable internals + architectural constraints
