#!/bin/bash

# Launch Parallel Claude Code instances in iTerm2 - AUTO START VERSION
# This script opens iTerm2 with three vertical panes and automatically launches Claude Code

PROJECT_ROOT="/Users/bds2/Documents/kings-field-game"

osascript <<EOF
tell application "iTerm"
    activate

    -- Create a new window
    create window with default profile

    tell current session of current window
        -- First pane - feature-movement
        write text "cd ${PROJECT_ROOT}/.trees/feature-movement && clear"
        write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
        write text "echo '   MOVEMENT & CONTROLS'"
        write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
        write text "echo ''"
        write text "claude"
    end tell

    tell current window
        -- Split vertically for second pane - feature-environment
        tell current session
            set secondPane to (split vertically with default profile)
        end tell

        tell secondPane
            write text "cd ${PROJECT_ROOT}/.trees/feature-environment && clear"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "echo '   ENVIRONMENT & DUNGEONS'"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "echo ''"
            write text "claude"
        end tell

        -- Split the second pane vertically for third pane - feature-combat
        tell secondPane
            set thirdPane to (split vertically with default profile)
        end tell

        tell thirdPane
            write text "cd ${PROJECT_ROOT}/.trees/feature-combat && clear"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "echo '   COMBAT SYSTEM'"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "echo ''"
            write text "claude"
        end tell
    end tell
end tell
EOF

echo ""
echo "✓ iTerm2 launched with 3 Claude instances!"
echo ""
echo "Worktrees:"
echo "  1. feature-movement     → Player controls & movement system"
echo "  2. feature-environment  → Dungeon generation & environment"
echo "  3. feature-combat       → Combat mechanics"
