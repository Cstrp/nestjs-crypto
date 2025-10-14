# Release Guide

This document describes the release process for nestjs-crypto.

## Automated Release (Recommended)

### Using GitHub Actions (Manual Trigger)

1. Go to GitHub Actions tab
2. Select "Release" workflow
3. Click "Run workflow"
4. Choose version bump type:
   - `patch` - Bug fixes (1.0.0 → 1.0.1)
   - `minor` - New features (1.0.0 → 1.1.0)
   - `major` - Breaking changes (1.0.0 → 2.0.0)
5. Click "Run workflow"

The workflow will:
- Run all tests
- Bump version in package.json
- Update CHANGELOG.md
- Create a git tag
- Push to GitHub
- Publish to npm
- Create GitHub Release

### Using Local Scripts

For quick releases from your local machine:

```bash
# Patch release (1.0.0 → 1.0.1)
npm run release:patch

# Minor release (1.0.0 → 1.1.0)
npm run release:minor

# Major release (1.0.0 → 2.0.0)
npm run release:major
```

This will:
- Bump version
- Create git tag
- Push to GitHub
- Trigger GitHub Actions to publish to npm

## Manual Release (Not Recommended)

If you need to publish manually:

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Run tests
npm test

# 3. Bump version
npm version patch  # or minor, or major

# 4. Build package
npm run build

# 5. Publish to npm
npm publish --access public

# 6. Push to GitHub
git push origin main --tags
```

## Version Bump Guidelines

### Patch (x.x.X)
- Bug fixes
- Documentation updates
- Internal refactoring
- Dependency updates (non-breaking)

### Minor (x.X.0)
- New features
- New methods/properties
- Deprecations (with backward compatibility)
- Performance improvements

### Major (X.0.0)
- Breaking API changes
- Removed deprecated features
- Major refactoring
- Changed behavior of existing methods

## Pre-Release Checklist

Before releasing, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] CHANGELOG.md is updated
- [ ] Documentation is up to date
- [ ] No uncommitted changes
- [ ] You're on the main branch

## Post-Release Checklist

After releasing, verify:

- [ ] npm package is published: https://www.npmjs.com/package/nestjs-crypto
- [ ] GitHub release is created: https://github.com/Cstrp/nestjs-crypto/releases
- [ ] Documentation is deployed: https://cstrp.github.io/nestjs-crypto/
- [ ] Git tag is pushed
- [ ] Package can be installed: `npm install nestjs-crypto@latest`

## CI/CD Workflows

### 1. CI (Continuous Integration)
- **Trigger:** Push to main/develop, Pull Requests
- **Actions:**
  - Run tests on Node.js 18.x, 20.x, 22.x
  - Run linter
  - Type checking
  - Upload coverage

### 2. Publish to npm
- **Trigger:** Push tags matching `v*.*.*`
- **Actions:**
  - Run tests
  - Build package
  - Publish to npm
  - Create GitHub Release

### 3. Deploy Documentation
- **Trigger:** Push to main, Manual trigger
- **Actions:**
  - Build VitePress docs
  - Build TypeDoc API docs
  - Deploy to GitHub Pages

### 4. Release (Manual)
- **Trigger:** Manual workflow dispatch
- **Actions:**
  - Bump version
  - Update CHANGELOG
  - Create tag
  - Publish to npm
  - Create GitHub Release

## Setting Up Secrets

To enable automated publishing, add these secrets to your GitHub repository:

### NPM_TOKEN

1. Go to https://www.npmjs.com/
2. Login to your account
3. Go to "Access Tokens" in account settings
4. Click "Generate New Token"
5. Select "Automation" type
6. Copy the token
7. Go to your GitHub repo → Settings → Secrets and variables → Actions
8. Click "New repository secret"
9. Name: `NPM_TOKEN`
10. Value: Paste your npm token
11. Click "Add secret"

### GITHUB_TOKEN

This is automatically provided by GitHub Actions. No setup needed.

## Troubleshooting

### "You cannot publish over the previously published versions"

This means the version in package.json already exists on npm. Solutions:

1. Bump the version: `npm run version:patch`
2. Or manually update version in package.json

### "npm ERR! need auth"

Your npm token is missing or invalid:

1. Check if NPM_TOKEN secret exists in GitHub
2. Verify token is valid on npmjs.com
3. Ensure token has "Automation" permission

### Tests fail during publish

1. Run tests locally: `npm test`
2. Fix any failing tests
3. Commit and push changes
4. Try release again

### Documentation not deploying

1. Check GitHub Pages is enabled in repo settings
2. Verify docs workflow ran successfully
3. Check if build step failed
4. Ensure no errors in VitePress config

## Manual Version Bump Only

If you only want to bump version without publishing:

```bash
# Update version in package.json (no git tag)
npm version patch --no-git-tag-version

# Or use one of these
npm version minor --no-git-tag-version
npm version major --no-git-tag-version
```

Then commit manually:

```bash
git add package.json package-lock.json
git commit -m "chore: bump version to X.X.X"
git push
```

## Rolling Back a Release

If you need to unpublish a version (within 72 hours):

```bash
# Unpublish specific version
npm unpublish nestjs-crypto@1.0.1

# Or unpublish entire package (careful!)
npm unpublish nestjs-crypto --force
```

**Note:** npm doesn't allow unpublishing versions older than 72 hours. Instead, publish a new version with fixes.

## Support

For issues with releases:
- Open an issue: https://github.com/Cstrp/nestjs-crypto/issues
- Check CI/CD logs in GitHub Actions
- Verify npm publish status: https://www.npmjs.com/package/nestjs-crypto
