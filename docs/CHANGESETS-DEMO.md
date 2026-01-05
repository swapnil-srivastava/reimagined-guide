# Changesets Quick Start Demo

This guide shows you how to use Changesets for version management in practice.

## Example Workflow

### Scenario: Adding a New Feature

Let's say you've just added a dark mode toggle to the navbar.

#### Step 1: Make your changes
```bash
# Edit files
vim apps/web/components/AwesomeNavBar.tsx

# Stage changes
git add apps/web/components/AwesomeNavBar.tsx
```

#### Step 2: Commit with conventional commit
```bash
git commit -m "feat: add dark mode toggle to navbar

Added a toggle button in the navbar that allows users to switch
between light and dark themes. The preference is saved in localStorage."
```

#### Step 3: Create a changeset
```bash
pnpm changeset
```

**Changesets will prompt you:**

```
🦋  Which packages would you like to include?
◯ @swapnilsrivastava/web

# Press SPACE to select, then ENTER
```

```
🦋  What kind of change is this for @swapnilsrivastava/web?
  major
❯ minor  ← Select this for features
  patch
```

```
🦋  Please enter a summary for this change:
│ Added dark mode toggle to navbar with localStorage persistence
```

**Result:** A new changeset file is created in `.changeset/`:

```markdown
---
"@swapnilsrivastava/web": minor
---

Added dark mode toggle to navbar with localStorage persistence
```

#### Step 4: Commit the changeset
```bash
git add .changeset/
git commit -m "chore: add changeset for dark mode toggle"
```

#### Step 5: Push and create PR
```bash
git push origin feature/dark-mode-toggle
# Create PR on GitHub
```

### Scenario: Fixing a Bug

#### Step 1: Fix the bug
```bash
vim apps/web/components/CartPage.tsx
git add apps/web/components/CartPage.tsx
```

#### Step 2: Commit with conventional commit
```bash
git commit -m "fix: correct cart total calculation for discounted items

Fixed an issue where discounts were not being properly applied
to the cart total. Now correctly calculates with percentage discounts."
```

#### Step 3: Create a changeset
```bash
pnpm changeset
# Select: @swapnilsrivastava/web
# Bump type: patch
# Summary: "Fixed cart total calculation for discounted items"
```

#### Step 4: Commit and push
```bash
git add .changeset/
git commit -m "chore: add changeset for cart fix"
git push origin fix/cart-calculation
```

### Scenario: Documentation Update (No Version Bump)

#### For documentation, tests, or refactoring - NO changeset needed:

```bash
# Update docs
vim README.md
git add README.md
git commit -m "docs: update installation instructions"
git push

# No changeset needed - docs don't bump versions!
```

## What Happens Next?

### When PRs are Merged

1. **Your PR is merged to `main`**
2. **GitHub Actions runs automatically**
3. **Changesets Bot creates a "Version Packages" PR**
   - This PR contains:
     - Updated `package.json` versions
     - Generated `CHANGELOG.md` entries
     - All changesets consumed (deleted)

### Example "Version Packages" PR

```markdown
# Version Packages

This PR was opened by the Changesets release GitHub action.

## Releases

### @swapnilsrivastava/web@0.2.0

#### Minor Changes
- abc1234: Added dark mode toggle to navbar with localStorage persistence

#### Patch Changes
- def5678: Fixed cart total calculation for discounted items
```

### When "Version Packages" PR is Merged

1. **Versions are officially bumped**
2. **CHANGELOG.md is generated**
3. **GitHub release is created** (if public packages)
4. **Packages published to npm** (if configured)

## Testing the System

### Create a Test Changeset

Let's create a test changeset to verify the system works:

```bash
# Make a small change
echo "\n// Test comment for versioning" >> apps/web/pages/index.tsx

# Commit
git add apps/web/pages/index.tsx
git commit -m "test: add comment to test versioning system"

# Create changeset
pnpm changeset
# Select: @swapnilsrivastava/web
# Type: patch
# Summary: "Testing changesets workflow"

# Commit changeset
git add .changeset/
git commit -m "chore: add test changeset"

# Push
git push origin main
```

**Watch for:**
1. GitHub Actions runs on your push
2. A new PR appears: "Version Packages"
3. PR shows version bump from 0.1.2 → 0.1.3
4. PR includes your changeset summary in CHANGELOG.md

## Common Patterns

### Multiple Changes in One PR

If you have multiple commits with changes:

```bash
# Commit 1: Feature
git commit -m "feat: add email notifications"

# Commit 2: Fix related to feature
git commit -m "fix: resolve notification timing issue"

# Create ONE changeset that covers both
pnpm changeset
# Type: minor (feature takes precedence)
# Summary: "Added email notifications with proper timing"
```

### Changes Across Multiple Packages

If you modify shared code:

```bash
pnpm changeset
# Select MULTIPLE packages:
# ✓ @swapnilsrivastava/web
# ✓ @swapnilsrivastava/utils

# Each package gets its own bump type
```

### Emergency Hotfix

For critical fixes that need immediate release:

```bash
# Fix the bug
git commit -m "fix: critical security vulnerability in auth"

# Create changeset
pnpm changeset  # Select "patch"

# Commit changeset
git add .changeset/
git commit -m "chore: add changeset for security fix"

# Push to main
git push origin main

# Wait for "Version Packages" PR
# Merge immediately
# Deployment happens automatically
```

## Troubleshooting

### "No packages selected" error

Make sure you're selecting at least one package with SPACE before pressing ENTER.

### Changeset not showing in PR

Make sure you committed the changeset file:
```bash
git status  # Should show .changeset/*.md
git add .changeset/
git commit -m "chore: add changeset"
```

### Want to edit a changeset

Edit the markdown file directly:
```bash
vim .changeset/rare-cows-smile.md
git add .changeset/rare-cows-smile.md
git commit -m "chore: update changeset description"
```

### Need to delete a changeset

```bash
rm .changeset/rare-cows-smile.md
git add .changeset/rare-cows-smile.md
git commit -m "chore: remove incorrect changeset"
```

## Next Steps

1. **Read the full guide**: [VERSIONING.md](VERSIONING.md)
2. **Try it yourself**: Make a small change and create a changeset
3. **Watch GitHub Actions**: See the automation in action
4. **Review "Version Packages" PR**: Understand what gets generated

---

**Ready to version like a pro?** 🚀

Start with: `pnpm changeset` after your next feature commit!
