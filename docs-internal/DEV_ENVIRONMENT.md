# Development Environment

## Package Management

This project uses **pnpm** for dependency management.
However, scripts are run via `npm run` commands due to issues with `pnpm run` when invoked by Claude Code CLI on Windows.

## Main Dependencies

- **TypeScript**: For parsing and analyzing any TypeScript code specified by the user.
  Defined in `package.json` as a peer dependency.

## Tooling

- **TypeScript**: For all source code
- **biome**: Code quality checks (linting, formatting)
- **tsdown**: Build/bundle tool for TypeScript

## Directory Visibility

Some directories are gitignored but remain visible to Claude Code through `.ignore` file settings.

- `/dist/` – Build output (needed to verify compilation results)
- `/local/` – Local workspace files
- `/node_modules/typescript/` – TypeScript compiler API (imported in source code)
