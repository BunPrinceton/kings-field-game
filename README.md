# Kings Field Game

A King's Field-inspired first-person dungeon crawler built with Three.js.

## Features (Planned)

- First-person exploration
- Grid-based movement
- Atmospheric dungeon environments
- Combat system
- Inventory and items
- Magic system

## Development

```bash
npm install
npm run dev
```

## Parallel Development with Multiple Claude Instances

This project is set up for parallel development using git worktrees and multiple Claude Code instances!

### Launch 3 Claude Instances Side-by-Side

**Quick Start (Auto-launch):**
```bash
./launch-parallel-claude-auto.sh
```

This opens iTerm2 with 3 vertical panes, each running Claude Code in a different feature branch:
- **Pane 1**: Movement & Controls (`feature-movement`)
- **Pane 2**: Environment & Dungeons (`feature-environment`)
- **Pane 3**: Combat System (`feature-combat`)

### How It Works

Each Claude instance works independently on its own feature branch using git worktrees. This allows simultaneous development on multiple features without conflicts.

See [PARALLEL_DEVELOPMENT.md](PARALLEL_DEVELOPMENT.md) for detailed instructions.
