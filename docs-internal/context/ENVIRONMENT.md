# Development Environment

## Package Management

- Uses **pnpm** for dependency management
- Run scripts via `npm run` (pnpm run has Windows issues with Claude Code CLI)

## Main Dependencies

- **TypeScript** - Parsing/analyzing TypeScript code (peer dependency)

## Tooling

- **TypeScript** - All source code
- **biome** - Code quality checks (linting, formatting)
- **tsdown** - Build/bundle tool for TypeScript

## Directory Visibility

Gitignored but visible to Claude Code via `.ignore` settings:

- `/dist/` - Build output (verify compilation)
- `/local/` - Local workspace files  
- `/test-out/` - Test output directory
- `/node_modules/typescript/` - TypeScript compiler API (imported in source)