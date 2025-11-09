# Simplified Development Workflow

## Overview
Instead of complex parallel development with git worktrees, use a simpler single-branch workflow that's easier to manage.

## Recommended Workflow

### For Solo Development (Recommended)
Work directly on the main branch for small changes, or create feature branches for larger changes:

```bash
# For small fixes/improvements
git add .
git commit -m "Fix: description"
git push

# For larger features
git checkout -b feature/new-movement
# ... make changes ...
git add .
git commit -m "Add: new movement system"
git checkout main
git merge feature/new-movement
git push
```

### Using Claude Code Efficiently

Instead of multiple parallel Claude instances, use a single instance with clear task organization:

1. **Use the TodoWrite tool** - Claude Code has a built-in todo system
2. **Work on one feature at a time** - Focus prevents merge conflicts
3. **Commit frequently** - Small, focused commits are easier to manage

### Example Session

```bash
# Start Claude Code
claude

# In Claude Code, ask:
"Help me implement the movement system improvements.
Let's create a todo list and work through it systematically."

# Claude will:
1. Create a todo list
2. Work through each item
3. Test as you go
4. Commit when ready
```

## Benefits of Simplified Workflow

✅ **No merge conflicts** - Working on main or simple feature branches
✅ **Easier to understand** - No complex worktree management
✅ **Faster development** - Less time managing git, more time coding
✅ **Better for solo devs** - Parallel development is for teams
✅ **Claude Code works better** - Single context, maintains state

## When to Use Parallel Development

Only consider parallel development when:
- Working with multiple developers
- Features are completely independent
- You need to maintain multiple versions
- Testing experimental features

## Quick Commands

### See what changed
```bash
git status
git diff
```

### Save your work
```bash
git add .
git commit -m "Description of changes"
git push
```

### Create a backup branch
```bash
git checkout -b backup/before-big-change
git checkout main
```

### Undo recent changes
```bash
git reset --hard HEAD~1  # Undo last commit
git checkout -- .        # Discard all changes
```

## Tips for Using Claude Code

1. **Start with a plan** - "Let's plan out the movement system improvements"
2. **Use todos** - Claude Code will track progress automatically
3. **Test frequently** - "Let's test what we've built so far"
4. **Commit often** - "Create a commit for these changes"
5. **Ask for help** - "What's the best approach for this feature?"

## Removing Parallel Setup (Optional)

If you want to clean up the parallel development setup:

```bash
# List worktrees
git worktree list

# Remove worktrees
git worktree remove .trees/feature-movement --force
git worktree remove .trees/feature-environment --force
git worktree remove .trees/feature-combat --force

# Delete branches
git branch -D feature-movement
git branch -D feature-environment
git branch -D feature-combat

# Remove launch scripts (optional)
rm launch-parallel-claude*.sh
```

## Recommended Project Structure

Keep it simple:
```
kings-field-game/
├── src/           # Source code
├── public/        # Assets
├── docs/          # Documentation
├── node_modules/  # Dependencies
├── package.json   # Project config
└── README.md      # Project overview
```

## Next Steps

1. Focus on one feature at a time
2. Use Claude Code's todo system
3. Commit frequently with clear messages
4. Push to GitHub regularly for backup
5. Ask Claude Code for help when stuck

Remember: The best workflow is the one you'll actually use!