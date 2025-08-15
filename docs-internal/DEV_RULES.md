# Development Rules and Guidelines

## Commands

Use `npm run`, not `pnpm run`.
See [Development Environment](./DEV_ENVIRONMENT.md) for details.

- `npm run fix` - Check code quality (types, linting, and format) and fix if possible
- `npm run test:unit` - Run unit tests
- `npm run test` - Run all tests (includes unit tests, build, and integration tests)

## Development Workflow

- If you have multiple implementation phases, read this `DEV_RULES.md` file before each phase to ensure compliance with development rules
- Keep unit tests up-to-date with code changes
- After any changes, run commands: `npm run fix` and `npm run test:unit`
- Before reporting task completion, run command: `npm run test`

## Code Requirements

**Strictly adhere to the following rules for all production code:**

- Import/Export:
	- Use ESM (`import`/`export`) syntax.
	- Always include `.ts` extensions in import paths (e.g., `import { foo } from "./mod.ts"`).
	- Always import statically. Never use dynamic imports (`import(...)`).
	- Prefer named imports/exports (e.g., `import { foo } from "./mod.ts"`).
- Type System:
	- Avoid using the `any` type; prefer `unknown` when a type cannot be specified.
	- Use `any` only in constraint types for boundaries (e.g., `extends T` or `as const satisfies T`).
	- Do not use type assertions with `as T`, even if you believe the assertion is safe at runtime;
	  only allow in a few isolated utility functions.
	- Minimize runtime type checks. Maximize compile-time type checks.
	- Default type parameters should only be specified if alternative types are almost never needed.
- Module Separation:
	- If a module contains a function that should not be exported publicly but needs to be tested,
		place it in a separate module and mark it with a JSDoc `@package` tag.
		This allows importing for testing without exposing it to other modules.
	- Organize related modules into a package (subdirectory) for each meaningful group,
		ensuring that internal modules are only accessible within their package and not from outside.
- Programming Style:
	- Prefer functions over classes
	- Prefer stateless over stateful
	- Prefer immutability over mutability
- Comments:
	- Write concise documentation comments for each module at the top of the file.
	  However do not list out individual types or functions. Typically 1 line is sufficient
	- Write concise documentation comments for each type and function.
	  Focus on the responsibility and not the implementation details
	- Minimize implementation comments. Let the code speak for itself
	- Avoid explaining "recent changes"
- Temporary files:
	- When creating temporary files that are to be removed later, always use `TMP_` prefix.

## Patterns to Follow

- **Sum Types for Finite State Spaces:**
	- When you have a finite set of valid states, use sum types `type Choice = "a" | "b"`
	- "Make illegal states unrepresentable" - use types to eliminate invalid states/combinations at compile time
- **Focus on Cohesion of Each Function:**
	- First design functions with clear, single responsibilities (functional cohesion)
	- Then compose them into workflows (sequential cohesion)
- **Reduce Complexity of Package Dependency Graph:**
	- Aim for one-way dependencies. Avoid circular references among packages if possible
	- Suggest reorganizing packages when dependencies become complex

## Refactoring Guidelines

- **Structure-level refactoring** (e.g. module extraction, separation):
	- Preserve implementation of individual code blocks when moving in/between modules
	- Maintain existing documentation comments unless the logic/meaning changes
	- Focus changes on module boundaries and import/export statements
- **General changes**:
	- Do not maintain backward compatibility unless requested
	- Keep module dependencies simple and explicit
	- When restructuring modules, separate test modules accordingly to maintain 1:1 correspondence

## Tests

- Use Node.js built-in testing framework
- Each implementation module has a corresponding adjacent unit test module: `src/mod.ts` → `src/mod.test.ts`
- Mirror module structure within test `describe()` blocks
- Place integration tests in `test/` directory
