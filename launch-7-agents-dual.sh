#!/bin/bash

# Launch 7 Claude instances across TWO iTerm2 windows for better visibility
# Window 1: 4 panes (Controls, Level Design, Textures, Weapons)
# Window 2: 3 panes (UI, Narrative, Sound)

PROJECT_ROOT="/Users/bds2/Documents/kings-field-game"

osascript <<'EOF'
tell application "iTerm"
    activate

    -- WINDOW 1: First 4 agents (2x2 grid)
    set window1 to (create window with default profile)

    tell window1
        tell current session
            write text "cd /Users/bds2/Documents/kings-field-game/.trees/modernized-controls && clear"
            write text "echo '━━━━ 1. CONTROLS ━━━━' && claude"
        end tell

        -- Split vertically for agent 2
        tell current session
            set session2 to (split vertically with default profile)
        end tell

        tell session2
            write text "cd /Users/bds2/Documents/kings-field-game/.trees/level-design-pois && clear"
            write text "echo '━━━━ 2. LEVEL DESIGN ━━━━' && claude"
        end tell

        -- Split session2 vertically for agent 3
        tell session2
            set session3 to (split vertically with default profile)
        end tell

        tell session3
            write text "cd /Users/bds2/Documents/kings-field-game/.trees/textures-decorations && clear"
            write text "echo '━━━━ 3. TEXTURES ━━━━' && claude"
        end tell

        -- Split session3 vertically for agent 4
        tell session3
            set session4 to (split vertically with default profile)
        end tell

        tell session4
            write text "cd /Users/bds2/Documents/kings-field-game/.trees/player-weapons && clear"
            write text "echo '━━━━ 4. WEAPONS ━━━━' && claude"
        end tell
    end tell

    -- WINDOW 2: Last 3 agents (1x3 layout)
    delay 1
    set window2 to (create window with default profile)

    tell window2
        tell current session
            write text "cd /Users/bds2/Documents/kings-field-game/.trees/modern-ui && clear"
            write text "echo '━━━━ 5. UI/UX ━━━━' && claude"
        end tell

        -- Split vertically for agent 6
        tell current session
            set session6 to (split vertically with default profile)
        end tell

        tell session6
            write text "cd /Users/bds2/Documents/kings-field-game/.trees/narrative-text && clear"
            write text "echo '━━━━ 6. NARRATIVE ━━━━' && claude"
        end tell

        -- Split session6 vertically for agent 7
        tell session6
            set session7 to (split vertically with default profile)
        end tell

        tell session7
            write text "cd /Users/bds2/Documents/kings-field-game/.trees/sound-audio && clear"
            write text "echo '━━━━ 7. SOUND ━━━━' && claude"
        end tell
    end tell
end tell
EOF

echo ""
echo "✓ 7 Claude instances launched across 2 iTerm windows!"
echo ""
echo "Window 1 (4 panes):"
echo "  1. Controls | 2. Level Design | 3. Textures | 4. Weapons"
echo ""
echo "Window 2 (3 panes):"
echo "  5. UI/UX | 6. Narrative | 7. Sound"
echo ""
echo "Arrange windows side-by-side on your monitors!"
