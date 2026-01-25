# Code Style

## Import/Export

- Use ESM (`import`/`export`) syntax
- Always include `.ts` extensions: `import { foo } from "./mod.ts"`
- Always import statically (never dynamic `import(...)`)
- Prefer named imports (never `import * as X`)
- Prefer explicit exports (never `export * as X`)

## Type System

- Avoid `any` type; prefer `unknown` 
- Use `any` only in constraint types (`extends T`, `as const satisfies T`)
- No type assertions with `as T` except isolated utility functions
- Minimize runtime type checks, maximize compile-time checks
- Default type parameters only if alternatives almost never needed
- Local variables with object literals: use explicit named types

## Comments

- Concise module documentation at file top (typically 1 line)
- Concise documentation for types/functions (describe responsibility, not implementation)
- Minimize implementation comments
- Avoid explaining "recent changes"

## Programming Style

- Prefer functions, avoid classes
