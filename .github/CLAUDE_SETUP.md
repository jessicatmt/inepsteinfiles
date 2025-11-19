# Claude GitHub Integration

This repository is configured to work with Claude AI through GitHub Actions.

## How It Works

### Triggering Claude

Tag `@claude` in any of these locations:
- **Issue comments** - Claude will analyze and respond
- **Issue descriptions** - Claude will create a PR with fixes
- **Pull request comments** - Claude will review and suggest changes
- **Pull request descriptions** - Claude will analyze the PR

### Workflow

1. **You tag @claude** in an issue or PR
2. **GitHub Actions triggers** the Claude workflow
3. **Claude analyzes** the context (code, issue, PR)
4. **Claude responds** by:
   - Creating a pull request with fixes (for issues)
   - Commenting with analysis (for questions)
   - Suggesting changes (for PR reviews)

### Example Usage

**In an Issue:**
```markdown
@claude The search page is returning 500 errors when I try to look up names.
Can you investigate and fix this?
```

**In a PR Comment:**
```markdown
@claude Can you review this change and suggest improvements for performance?
```

**In a PR Description:**
```markdown
## Changes
- Added new search feature
- Updated UI components

@claude Please review this PR for security issues and code quality
```

## Configuration

### Required Secrets

The workflow requires these GitHub secrets to be set:

1. **ANTHROPIC_API_KEY** - Your Anthropic API key for Claude
   - Get one at: https://console.anthropic.com/
   - Add to: Settings → Secrets and variables → Actions → New repository secret

2. **GITHUB_TOKEN** - Automatically provided by GitHub Actions
   - No action needed, this is built-in

### Workflow File

The workflow is defined in: `.github/workflows/claude.yml`

It triggers on:
- New issues containing `@claude`
- Issue comments containing `@claude`
- Pull requests containing `@claude`
- PR comments containing `@claude`

## Permissions

Claude has these permissions:
- **Read** - Repository code, issues, PRs
- **Write** - Create PRs, add comments
- **No direct main branch commits** - All changes come via PRs for your review

## Integration with Vercel

### Automatic Preview Deployments

When Claude creates a pull request:
1. **Vercel detects the PR** (if GitHub integration is enabled)
2. **Vercel builds a preview** deployment automatically
3. **You can test** Claude's changes on the preview URL
4. **Merge when ready** to deploy to production

### Setup Vercel Integration

If you haven't already:
1. Go to Vercel dashboard
2. Settings → Git → Enable "Preview Deployments"
3. Ensure "Auto-Deploy" is enabled for PRs

## Best Practices

### Be Specific

❌ Bad: `@claude fix the bug`
✅ Good: `@claude The /search page returns 500 when searching for "Trump". Error in console: 'Cannot read property slug of undefined'. Can you debug and fix?`

### Provide Context

Include:
- Error messages
- Steps to reproduce
- Expected vs actual behavior
- Relevant file paths

### Review PRs

Always review Claude's PRs before merging:
1. Check the preview deployment
2. Review the code changes
3. Test the functionality
4. Merge or request changes

## Troubleshooting

### Claude Doesn't Respond

**Check:**
1. Is `@claude` spelled correctly?
2. Is the ANTHROPIC_API_KEY secret set?
3. Check Actions tab for workflow errors
4. Ensure the workflow file exists at `.github/workflows/claude.yml`

### Workflow Fails

**Common Issues:**
1. **API key invalid** - Regenerate at console.anthropic.com
2. **Build fails** - Check if dependencies are correct in `website/package.json`
3. **Permission denied** - Ensure workflow has correct permissions

### Preview Deployment Not Created

**Check Vercel:**
1. Settings → Git → Preview Deployments enabled?
2. Root Directory set to `website`?
3. Framework Detection set to Next.js?

## Limitations

- Claude operates on the GitHub copy of your code
- You need to `git pull` to get Claude's changes locally
- Claude creates PRs, not direct commits to main
- API usage counts toward your Anthropic quota

## Support

- **Claude Documentation**: https://docs.anthropic.com/
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Vercel Docs**: https://vercel.com/docs

---

*Last updated: 2024-11-19*
