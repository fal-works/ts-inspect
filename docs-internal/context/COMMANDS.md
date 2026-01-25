# Commands

Use `npm run`, not `pnpm run`.

## Development Commands

- **`npm run fix`** - Check code quality (types, linting, format) and fix if possible
- **`npm run test:unit`** - Run unit tests  
- **`npm run test`** - Run all tests (unit, build, integration)

## Workflow Requirements

- After any changes: `npm run fix` and `npm run test:unit`
- Before task completion: `npm run test`
- Keep unit tests up-to-date with code changes