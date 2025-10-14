# Contributing to NestJS Crypto

Thank you for your interest in contributing to NestJS Crypto! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Cstrp/nestjs-crypto/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (Node.js version, OS, etc.)
   - Code samples if applicable

### Suggesting Features

1. Check [Issues](https://github.com/Cstrp/nestjs-crypto/issues) for existing feature requests
2. Create a new issue with:
   - Clear use case
   - Proposed API or implementation
   - Why this feature would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Write or update tests
5. Update documentation
6. Run tests: `npm test`
7. Run linter: `npm run lint:fix`
8. Commit with conventional commit format
9. Push to your fork
10. Create a Pull Request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/Cstrp/nestjs-crypto.git
cd nestjs-crypto

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Build the package
npm run build
```

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(aes): add batch encryption method
fix(bcrypt): handle empty string validation
docs(readme): update installation instructions
test(aes): add edge case tests for decrypt
```

## Testing Guidelines

- Write tests for all new features
- Update tests when modifying existing features
- Aim for high code coverage (>80%)
- Test edge cases and error conditions
- Use descriptive test names

Example:
```typescript
describe('AesService', () => {
  describe('encrypt', () => {
    it('should encrypt data successfully', () => {
      // test implementation
    });

    it('should throw ValidationError for empty string', () => {
      // test implementation
    });
  });
});
```

## Code Style

- Use TypeScript
- Follow existing code style
- Use ESLint and Prettier (configured)
- Write clear, self-documenting code
- Add JSDoc comments for public APIs

## Documentation

When adding features:
- Update README.md if needed
- Add JSDoc comments
- Update or create documentation pages in `docs/`
- Add examples if applicable

## Release Process

See [RELEASE.md](./RELEASE.md) for the release process.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
