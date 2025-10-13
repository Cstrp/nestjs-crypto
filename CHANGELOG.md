# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-13

### Added

- Initial release of NestJS Crypto library
- Bcrypt service for password hashing with configurable salt rounds
- AES service for data encryption/decryption with automatic key/IV generation
- Automatic secret generation utilities
- Performance benchmarks for encryption methods
- Comprehensive TypeScript typing
- VitePress documentation
- TypeDoc API documentation
- Git hooks for automated checks and documentation deployment
- Support for both synchronous and asynchronous operations
- NestJS module integration with async configuration support

### Features

- 🔐 Dual encryption support (bcrypt + AES)
- ⚡ High-performance AES encryption
- 🔑 Automatic secure secret generation
- 🛡️ Industry-standard security algorithms
- 📚 Full documentation with examples
- 🔧 Strict TypeScript support
- 🧪 Built-in performance benchmarks
- 🚀 Seamless NestJS integration

### Security

- AES-256-CBC encryption
- Secure random key and IV generation
- Bcrypt password hashing with configurable rounds
- No hardcoded secrets
