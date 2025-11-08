# Parallel Development Guide

This project is set up to use **multiple Claude Code instances working in parallel** on different features simultaneously using git worktrees.

## Quick Start

### Option 1: Auto-Launch (Recommended)
```bash
./launch-parallel-claude-auto.sh
```
This automatically opens iTerm2 with 3 panes and starts Claude Code in each.

### Option 2: Manual Launch
```bash
./launch-parallel-claude.sh
```
This opens iTerm2 with 3 panes where you can manually type `claude` to start.

## Worktree Structure

```
kings-field-game/               # Main branch
├── .trees/
│   ├── feature-movement/       # Player movement & controls
│   ├── feature-environment/    # Dungeon generation & environment
│   └── feature-combat/         # Combat system
```

## How It Works

1. **Git Worktrees** create separate working directories for the same repo
2. Each worktree is on its own branch
3. Each Claude instance works independently without conflicts
4. When ready, merge branches back to main

## Suggested Feature Breakdown

### Pane 1: Movement & Controls (feature-movement)
- WASD/Arrow key movement
- Grid-based movement system
- Camera rotation
- Collision detection
- Movement animations

### Pane 2: Environment & Dungeons (feature-environment)
- Dungeon generation
- Wall/floor/ceiling rendering
- Lighting system
- Atmospheric effects (fog, particles)
- Level loading system

### Pane 3: Combat System (feature-combat)
- Enemy AI
- Attack mechanics
- Damage calculation
- Health/stats system
- Combat animations

## Merging Features Back

When a feature is complete:

```bash
# Switch to main branch
git checkout main

# Merge a feature branch
git merge feature-movement

# If there are conflicts, Claude Code can help resolve them
```

Or ask any Claude instance to merge all features together:
> "Please merge the feature-movement, feature-environment, and feature-combat branches into main and resolve any conflicts"

## Managing Worktrees

List all worktrees:
```bash
git worktree list
```

Remove a worktree when done:
```bash
git worktree remove .trees/feature-movement
```

## Tips

- Each Claude instance can see its own branch's changes only
- Communicate between instances by merging or rebasing
- Keep features independent to minimize merge conflicts
- Use descriptive commit messages in each worktree
