# AGENTS.md

## Build, Lint, and Test Commands

### Build

- **Full Build**: `npm run build`
- **Development Watch Mode**: `npm run dev`

### Lint

- **Run ESLint**: `npx eslint .`
- **Fix Lint Errors**: `npx eslint . --fix`

### Test

- **Run All Tests**: Currently, no test scripts are defined in `package.json`. Add a test framework like Jest or Mocha to enable testing.
- **Run a Single Test**: Define test scripts in `package.json` to enable this functionality.

## Code Style Guidelines

### General

- **Language**: TypeScript with strict type checking enabled.
- **Target**: ES2020 with support for ES2021 and DOM libraries.
- **Output**: Compiled files are output to the `dist` directory.

### Imports

- Use ES module syntax.
- Group imports by standard libraries, third-party libraries, and local modules.

### Formatting

- Follow the ESLint `js/recommended` and `typescript-eslint/recommended` configurations.
- Use consistent casing in file names.

### Types

- Always use explicit types where possible.
- Enable `strict` mode in TypeScript for better type safety.

### Naming Conventions

- Use camelCase for variables and functions.
- Use PascalCase for classes and interfaces.
- Use UPPER_CASE for constants.

### Error Handling

- Always handle errors explicitly.
- Use `try-catch` blocks for asynchronous code.

### Additional Notes

- JSON files follow `json/recommended` rules.
- Markdown files follow `markdown/recommended` rules.

---

This document is intended for agentic coding agents working in this repository. Ensure adherence to these guidelines for consistency and maintainability.
