#!/bin/bash

# Launch Parallel Claude Code instances in iTerm2
# This script opens iTerm2 with three vertical panes running Claude Code in different worktrees

PROJECT_ROOT="/Users/bds2/Documents/kings-field-game"

osascript <<EOF
tell application "iTerm"
    activate

    -- Create a new window
    create window with default profile

    tell current session of current window
        -- First pane - feature-movement
        write text "cd ${PROJECT_ROOT}/.trees/feature-movement"
        write text "echo '=== FEATURE: MOVEMENT & CONTROLS ==='"
        write text "echo 'Ready to launch Claude Code...'"
        write text "echo 'Type: claude'"
        write text "echo ''"
    end tell

    tell current window
        -- Split vertically for second pane - feature-environment
        tell current session
            set secondPane to (split vertically with default profile)
        end tell

        tell secondPane
            write text "cd ${PROJECT_ROOT}/.trees/feature-environment"
            write text "echo '=== FEATURE: ENVIRONMENT & DUNGEONS ==='"
            write text "echo 'Ready to launch Claude Code...'"
            write text "echo 'Type: claude'"
            write text "echo ''"
        end tell

        -- Split the second pane vertically for third pane - feature-combat
        tell secondPane
            set thirdPane to (split vertically with default profile)
        end tell

        tell thirdPane
            write text "cd ${PROJECT_ROOT}/.trees/feature-combat"
            write text "echo '=== FEATURE: COMBAT SYSTEM ==='"
            write text "echo 'Ready to launch Claude Code...'"
            write text "echo 'Type: claude'"
            write text "echo ''"
        end tell
    end tell
end tell
EOF

echo ""
echo "iTerm2 launched with 3 panes!"
echo ""
echo "Each pane is ready in its worktree:"
echo "  - Pane 1: feature-movement"
echo "  - Pane 2: feature-environment"
echo "  - Pane 3: feature-combat"
echo ""
echo "Type 'claude' in each pane to start Claude Code!"
