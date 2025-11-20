# GitHub Actions Workflow Guide

This document explains the automated workflows for the InEpsteinFiles project.

## Overview

We have three workflows that work together to ensure quality:

1. **CI Workflow** (`ci.yml`) - Automated testing on PRs
2. **Claude Assistant** (`claude.yml`) - AI-assisted bug fixes (with manual approval)
3. **Issue Verification** (`issue-verification.yml`) - Reminds you to test fixes before closing issues

## Workflow 1: CI - Automated Testing

**Triggers:** Every PR to `main` that touches `website/**`

**What it does:**
- ✅ Installs dependencies
- ✅ Runs linter
- ✅ Runs tests
- ✅ Builds the website
- ✅ Comments on PR with results

**Status checks:**
- PRs will show ❌ if tests fail
- PRs will show ✅ if tests pass

**You'll be notified** via comment when tests complete.

## Workflow 2: Claude AI Assistant (Modified)

**Triggers:** When someone mentions `@claude` in an issue or PR

**What it does:**
- Creates a PR with suggested fixes
- **Requests your review** automatically
- Adds labels: `awaiting-review` and `claude-generated`
- **Does NOT auto-merge** (requires manual approval)
- Adds a checklist comment for you to follow

**The checklist includes:**
- [ ] Tests pass (check CI workflow)
- [ ] Changes actually fix the reported issue
- [ ] No unintended side effects
- [ ] Code quality is acceptable

**Important:** Claude will NOT merge PRs automatically anymore!

## Workflow 3: Issue Verification Helper

**Triggers:** When a PR with `claude-generated` label is merged

**What it does:**
- Finds linked issues in the PR description
- Comments on those issues asking you to verify
- Adds `needs-verification` label
- **Does NOT auto-close** the issue

**You'll see a comment like:**
```
🎉 PR #XX has been merged!

⚠️ Action Required - Verify the Fix

Please test that this fix actually resolves the issue:
1. Test the fix on the deployed site or locally
2. Verify the original problem is resolved
3. Check for any side effects

Once verified:
- ✅ Close with: "Verified - works as expected"
- ⚠️ Re-open if broken: "Issue still occurs because..."
```

## Your New Workflow

### When Claude creates a PR for a bug:

1. **Wait for CI tests** to complete (you'll get a notification)
   - If tests fail ❌ → Ask Claude to fix them
   - If tests pass ✅ → Continue to review

2. **Review the code changes**
   - Check that the fix makes sense
   - Look for unintended changes
   - Verify code quality

3. **Test the fix manually**
   - Pull the PR branch locally OR
   - Wait for Vercel preview deployment
   - Actually reproduce the bug and verify it's fixed

4. **Merge when ready**
   - Approve the PR
   - Merge manually
   - Issue will **NOT** auto-close

5. **Verify on production**
   - After merge, test on the live site
   - Check the issue has the `needs-verification` label
   - Manually close with: "Verified - works as expected"

## Quick Commands

### Testing a PR locally:
```bash
# Fetch PR branch
git fetch origin pull/PR_NUMBER/head:pr-PR_NUMBER
git checkout pr-PR_NUMBER

# Test it
cd website
npm ci
npm test
npm run build
npm run dev

# Go back to main
git checkout main
```

### Closing verified issues:
```bash
# Comment on the issue before closing:
"Verified - fix works as expected in production ✅"

# Then close the issue via UI or:
gh issue close ISSUE_NUMBER -c "Verified - fix works as expected ✅"
```

## Benefits of This Approach

✅ **No surprise merges** - You approve everything
✅ **Automated testing** - Catch regressions early
✅ **Manual verification** - Ensure fixes actually work
✅ **Clear tracking** - Labels show what needs attention
✅ **Production confidence** - Test before closing issues

## Labels You'll See

- `claude-generated` - PR was created by Claude
- `awaiting-review` - Needs your review
- `needs-verification` - Issue needs testing after merge
- `pr-merged` - PR is merged, awaiting verification

## Customization

You can adjust these workflows by editing:
- `.github/workflows/ci.yml` - Test configuration
- `.github/workflows/claude.yml` - Claude behavior
- `.github/workflows/issue-verification.yml` - Verification reminders

---

**Last Updated:** 2024-11-20
**Maintainer:** jessica.suarez@gmail.com
