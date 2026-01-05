# Version Management with Changesets

This monorepo uses **Changesets** for automated version management and publishing. Changesets works with conventional commits to manage versions across all apps and packages.

## 🚀 Quick Start

### Creating a Changeset

When you make changes that should trigger a version bump, create a changeset:

```bash
pnpm changeset
```

This will prompt you to:
1. **Select packages** that have changed
2. **Choose bump type** (major, minor, patch)
3. **Write a summary** describing the changes

### Conventional Commit Types to Changeset Mapping

Follow these conventional commit patterns:

- **`feat:`** → **Minor version** (0.1.0 → 0.2.0)
  ```bash
  git commit -m "feat: add user profile export feature"
  pnpm changeset  # Select "minor"
  ```

- **`fix:`** → **Patch version** (0.1.0 → 0.1.1)
  ```bash
  git commit -m "fix: resolve authentication token expiry"
  pnpm changeset  # Select "patch"
  ```

- **`BREAKING CHANGE:`** → **Major version** (0.1.0 → 1.0.0)
  ```bash
  git commit -m "feat!: redesign API endpoints
  
  BREAKING CHANGE: API v1 endpoints removed, migrate to v2"
  pnpm changeset  # Select "major"
  ```

- **`chore:`, `docs:`, `style:`, `refactor:`, `test:`** → **No version bump**
  ```bash
  git commit -m "docs: update README with new features"
  # No changeset needed
  ```

## 📦 Workflow

### 1. Development Phase

Make your changes and commit with conventional commit messages:

```bash
# Make changes to apps/web
git add apps/web/
git commit -m "feat: add dark mode toggle to navbar"

# Create a changeset
pnpm changeset
# Select: @swapnilsrivastava/web
# Bump type: minor
# Summary: "Added dark mode toggle to navbar"
```

### 2. Creating Multiple Changesets

If you have multiple unrelated changes:

```bash
# First feature
git commit -m "feat: add email notifications"
pnpm changeset  # Create changeset for feature 1

# Second bug fix
git commit -m "fix: resolve cart total calculation"
pnpm changeset  # Create changeset for feature 2
```

### 3. Review Changesets

Changesets are stored in `.changeset/` directory:

```bash
ls .changeset/
# Output:
# config.json
# README.md
# rare-cows-smile.md  <- Your changeset
```

### 4. Version Bumping (Maintainers)

When ready to release, bump versions:

```bash
# This will:
# 1. Update package.json versions
# 2. Update CHANGELOG.md files
# 3. Delete consumed changesets
pnpm version-packages
```

### 5. Publishing (Automated via GitHub Actions)

Push to `main` branch:

```bash
git add .
git commit -m "chore: version packages"
git push origin main
```

**GitHub Actions will automatically:**
1. Create a "Version Packages" PR with:
   - Updated versions in package.json
   - Generated CHANGELOG.md files
   - All changesets consumed
2. When you merge that PR:
   - Publish packages to npm (if configured)
   - Create GitHub releases
   - Tag releases with version numbers

## 📋 Available Commands

```bash
# Create a new changeset
pnpm changeset
pnpm changeset:add  # Alias

# Version packages (consume changesets)
pnpm changeset:version
pnpm version-packages  # Recommended (also updates lockfile)

# Publish to npm (usually done by CI)
pnpm changeset:publish

# Check changeset status
pnpm changeset status
```

## 🎯 Best Practices

### 1. One Changeset per Logical Change

```bash
# ✅ Good
git commit -m "feat: add user export feature"
pnpm changeset  # One changeset for one feature

# ❌ Avoid
git commit -m "feat: add multiple features and fix bugs"
pnpm changeset  # Mixing features and fixes
```

### 2. Descriptive Changeset Summaries

```bash
# ✅ Good changeset summary
"Added user profile export feature with CSV and JSON support"

# ❌ Bad changeset summary
"Updated files"
```

### 3. Commit Changeset Files

Always commit the generated changeset files:

```bash
git add .changeset/rare-cows-smile.md
git commit -m "chore: add changeset for user export feature"
```

### 4. Multiple Package Changes

If your change affects multiple packages:

```bash
pnpm changeset
# Select all affected packages:
# ✓ @swapnilsrivastava/web
# ✓ @swapnilsrivastava/utils
```

## 🔄 Conventional Commits Reference

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature (minor bump)
- **fix:** Bug fix (patch bump)
- **docs:** Documentation only
- **style:** Code style changes (formatting, no logic change)
- **refactor:** Code refactoring (no feature change)
- **perf:** Performance improvements (patch or minor)
- **test:** Adding or updating tests
- **chore:** Maintenance tasks, tooling
- **ci:** CI/CD configuration changes
- **build:** Build system or dependencies

### Breaking Changes

Add `!` after type or `BREAKING CHANGE:` in footer:

```bash
# Option 1: Using !
git commit -m "feat!: redesign authentication system"

# Option 2: Using footer
git commit -m "feat: redesign authentication system

BREAKING CHANGE: Old auth tokens are no longer valid. 
Users must re-authenticate using the new OAuth flow."
```

## 📊 Example Workflow

```bash
# 1. Start feature branch
git checkout -b feature/user-notifications

# 2. Implement feature
# ... make changes to apps/web/components/NotificationBell.tsx

# 3. Commit with conventional commit
git add .
git commit -m "feat: add real-time notification bell component"

# 4. Create changeset
pnpm changeset
# ? Which packages would you like to include? › @swapnilsrivastava/web
# ? What kind of change is this for @swapnilsrivastava/web? › minor
# ? Please enter a summary for this change:
#   Added real-time notification bell component with badge counter

# 5. Commit changeset
git add .changeset/
git commit -m "chore: add changeset for notification feature"

# 6. Push and create PR
git push origin feature/user-notifications
# Create PR on GitHub

# 7. After PR merge, maintainer creates version PR
pnpm version-packages
git add .
git commit -m "chore: version packages"
git push

# 8. GitHub Actions handles the rest!
```

## 🔐 Configuration

### Changeset Config (`.changeset/config.json`)

```json
{
  "changelog": [
    "@changesets/changelog-github",
    { "repo": "swapnil-srivastava/reimagined-guide" }
  ],
  "commit": false,
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@swapnilsrivastava/eslint-config"]
}
```

**Key Settings:**
- **changelog:** Uses GitHub changelog with links to PRs/issues
- **commit:** Set to `false` (you commit changesets manually)
- **access:** Set to `public` for npm publishing
- **baseBranch:** Main branch for version comparison
- **ignore:** Packages that shouldn't trigger versions

### GitHub Actions (`.github/workflows/release.yml`)

The workflow automatically:
- Runs on pushes to `main`
- Installs dependencies
- Builds the project
- Creates "Version Packages" PR
- Publishes to npm when version PR is merged

**Required Secrets:**
- `GITHUB_TOKEN` (automatic)
- `NPM_TOKEN` (for npm publishing - set in repo secrets)

## 🎓 Learning Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Turborepo + Changesets Guide](https://turbo.build/repo/docs/handbook/publishing-packages/versioning-and-publishing)

## ❓ FAQ

### Q: Do I need a changeset for every commit?

**A:** No! Only create changesets for commits that should trigger version bumps:
- ✅ Features (`feat:`)
- ✅ Bug fixes (`fix:`)
- ✅ Breaking changes (`feat!:`, `fix!:`)
- ❌ Documentation (`docs:`)
- ❌ Tests (`test:`)
- ❌ Refactoring (`refactor:`)
- ❌ Chores (`chore:`)

### Q: Can I create a changeset after committing?

**A:** Yes! You can create changesets at any time:

```bash
git commit -m "feat: add feature"
# Forgot to create changeset? No problem:
pnpm changeset
git add .changeset/
git commit -m "chore: add changeset for previous commit"
```

### Q: How do I version multiple packages together?

**A:** Select multiple packages when creating the changeset:

```bash
pnpm changeset
# Select both:
# ✓ @swapnilsrivastava/web
# ✓ @swapnilsrivastava/utils
```

### Q: What if I need to edit a changeset?

**A:** Edit the markdown file in `.changeset/`:

```bash
# Find your changeset
ls .changeset/

# Edit it
vim .changeset/rare-cows-smile.md

# Commit the change
git add .changeset/rare-cows-smile.md
git commit -m "chore: update changeset description"
```

### Q: How do I skip publishing certain packages?

**A:** Use `"private": true` in package.json:

```json
{
  "name": "@swapnilsrivastava/web",
  "version": "0.1.2",
  "private": true  // Won't publish to npm
}
```

---

**Ready to start versioning?** Run `pnpm changeset` after your next feature! 🚀
