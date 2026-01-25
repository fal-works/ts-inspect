# Testing

## Framework

Use Node.js built-in testing framework.

## Organization

- **Unit tests**: Each `src/mod.ts` has adjacent `src/mod.test.ts`
- **Integration tests**: Place in `test/` directory
- **Fixtures**: Place in `test/fixtures/` directory

## Naming Convention

```javascript
describe("path/to/module-name", () -> {
  describe("functionName", () -> {
    // test code
  });
});
```

## Test Requirements

- Keep unit tests up-to-date with code changes
- Run after changes: `npm run test:unit`
- Run before completion: `npm run test`

## Refactoring Guidelines

- Maintain 1:1 correspondence between implementation and test modules
- Separate test modules when restructuring main modules