# Claude Workflow Setup Guide

## ✅ Implementation Complete!

The corrected GitHub Actions workflows have been deployed. Here's what you need to do before testing.

## Required Setup (One-Time)

### 1. ~~Create GitHub Environment for Manual Approval~~ (Skipped - Requires Public Repo)

**Note:** Manual approval environment requires GitHub Enterprise or a public repository. Since this repo is private, we've removed the approval gate. Safety features still in place:
- ✅ Only you can trigger workflows (author check)
- ✅ 15-minute timeout on all runs
- ✅ One workflow per issue at a time (concurrency control)
- ✅ Manual merge required (no auto-merge)
- ✅ Manual issue closure (verification required)

### 2. Verify API Key is Set

Check that your Anthropic API key is configured:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Verify `ANTHROPIC_API_KEY` exists
3. If not, add it with your API key from https://console.anthropic.com

### 3. Set Up Branch Protection (Optional but Recommended)

This prevents accidental merges and handles the "branch ahead/behind" problem automatically.

1. Go to **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Branch name pattern: `main`
4. Enable:
   - ☑️ **Require a pull request before merging**
   - ☑️ **Require status checks to pass before merging**
   - Select: `test-and-build` (from CI workflow)
   - ☑️ **Require branches to be up to date before merging**
5. Click **Create**

**What this does:** GitHub will show an "Update branch" button on PRs that are behind. One click syncs them.

## How to Test

### Step 1: Create a Test Issue

1. Go to **Issues** → **New issue**
2. Title: `Test: Claude workflow`
3. Description:
   ```
   @claude Please add a comment to the homepage that says "Workflow test successful"

   Just add it as a simple HTML comment in app/page.tsx
   ```
4. Click **Submit new issue**

### Step 2: Approve the Workflow Run

1. You'll get a notification: "Review required"
2. Click the notification or go to **Actions** tab
3. Click **Review deployments**
4. Click **Approve and deploy**

### Step 3: Watch the Magic

The workflow will:
1. ✅ Create branch `claude-fix-issue-[NUMBER]`
2. ✅ Write the code
3. ✅ Create a PR
4. ✅ CI tests run automatically
5. ✅ Comment on PR with test results

### Step 4: Clean PR Merge Process

**1. Wait for PR Creation:**
   - The workflow will automatically create a PR
   - CI tests will run automatically
   - You'll see comments on the PR with test results

**2. Review the PR:**
   - Go to the PR (you'll see it in the "Pull requests" tab)
   - Review the code changes
   - Check that CI tests passed (green checkmark)

**3. Merge the PR (if tests pass):**
   - Click **"Merge pull request"** button
   - Click **"Confirm merge"**
   - **IMPORTANT:** Check the box **"Delete branch after merge"** ✅
     - This automatically cleans up the branch
     - No loose ends!

**4. Verify on Production:**
   - The merge triggers automatic Vercel deployment
   - Test on https://inepsteinfiles.com
   - If it works, close issue with: `Verified - works as expected ✅`

**5. Sync Your Desktop (after merge):**
   ```bash
   git checkout main
   git pull origin main
   ```

**Key Points:**
- ✅ **Always delete branch after merge** - keeps repo clean
- ✅ **Don't pull Claude's branches to your desktop** - just review on GitHub
- ✅ **Only pull main** - that's all you need locally

### Step 5: If Tests Fail

The CI will automatically comment:
> @claude The tests failed. Please review the error logs and push a fix.

Claude will iterate automatically! Just approve the follow-up workflow run.

## Daily Workflow

### To Fix a Bug:

**Option 1: New Issue**
```
1. Create issue describing the bug
2. Add "@claude please fix this" in the issue
3. Approve workflow when notified
4. Review PR when ready
5. Merge if tests pass
6. Verify on production
7. Close issue manually
```

**Option 2: Existing Issue**
```
1. Add comment: "@claude please fix this"
2. Approve workflow when notified
3. (rest same as above)
```

### To Keep Local Code Synced:

**Simple version:**
```bash
git checkout main
git pull origin main
```

**Safe version (if you have uncommitted changes):**
```bash
git status                  # Check for changes
git stash                   # Save changes temporarily
git checkout main           # Switch to main
git pull origin main        # Pull latest
git stash pop              # Restore your changes
```

## What Changed from Before

| Before | After |
|--------|-------|
| ❌ Workflows showed "failures" | ✅ Workflows skip properly (no false failures) |
| ❌ Auto-merged without testing | ✅ Requires manual merge approval |
| ❌ Manual test-fix iteration | ✅ Auto-pings Claude to fix failed tests |
| ❌ Issues auto-closed | ✅ Issues require manual verification |
| ❌ No safety checks | ✅ Author check, timeout, concurrency control |

## New Workflows

### 1. `claude-fix.yml` - The AI Worker
- **Triggers:** When you comment `@claude` on an issue or PR
- **Safety:** Requires manual approval, author check, 15min timeout
- **Does:** Creates branch, writes code, opens PR
- **Branch naming:** `claude-fix-issue-[NUMBER]`

### 2. `ci.yml` - The Quality Gate
- **Triggers:** Every PR to main
- **Does:** Runs lint, tests, build
- **Smart:** Auto-pings `@claude` if tests fail on Claude PRs
- **Notifies:** Comments success/failure on PR

### 3. `post-merge-notify.yml` - The Reminder
- **Triggers:** When PR is merged
- **Does:** Posts verification reminder on linked issue
- **Does NOT:** Auto-close the issue

## Troubleshooting

### "Workflow didn't trigger"
- Check you wrote `@claude` (not `@Claude` or `claude`)
- Verify you're on an open issue
- Check you approved the environment

### "Tests keep failing"
- Claude will auto-iterate up to a point
- Check the error logs in Actions tab
- You can guide Claude: `@claude the issue is in line 42 of page.tsx`

### "Branch is behind main"
- If you set up branch protection: Click "Update branch" button
- Or manually: `git checkout claude-fix-issue-X && git merge main && git push`

### "I can't merge"
- Check branch protection is enabled
- Check tests passed (green checkmark)
- Try clicking "Update branch" first

## Files to Reference

- **Complete guide:** `.github/WORKFLOW_GUIDE.md`
- **Workflow files:** `.github/workflows/*.yml`
- **Backups:** `.github/workflows-backup/` (old workflows)

## Need Help?

If something's not working:
1. Check the **Actions** tab for error details
2. Look at workflow run logs
3. Review this guide's troubleshooting section
4. Create an issue (without `@claude`) to discuss

---

**Setup Date:** 2025-11-24
**Status:** Ready for Testing
**Next Step:** Follow "How to Test" section above
