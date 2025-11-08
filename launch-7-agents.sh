#!/bin/bash

# Launch 7 Parallel Claude Code instances in iTerm2 - Iteration 2
# Layout: 4 panes on top row, 3 panes on bottom row

PROJECT_ROOT="/Users/bds2/Documents/kings-field-game"

osascript <<EOF
tell application "iTerm"
    activate
    create window with default profile

    tell current session of current window
        -- Pane 1: Controls Expert
        write text "cd ${PROJECT_ROOT}/.trees/modernized-controls && clear"
        write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
        write text "echo '   1. CONTROLS MODERNIZATION'"
        write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
        write text "claude"
    end tell

    tell current window
        -- Split vertically for pane 2
        tell current session
            set pane2 to (split vertically with default profile)
        end tell

        tell pane2
            write text "cd ${PROJECT_ROOT}/.trees/level-design-pois && clear"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "echo '   2. LEVEL DESIGN (POIs)'"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "claude"
        end tell

        -- Split pane2 vertically for pane 3
        tell pane2
            set pane3 to (split vertically with default profile)
        end tell

        tell pane3
            write text "cd ${PROJECT_ROOT}/.trees/textures-decorations && clear"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "echo '   3. TEXTURES & DECORATIONS'"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "claude"
        end tell

        -- Split pane3 vertically for pane 4
        tell pane3
            set pane4 to (split vertically with default profile)
        end tell

        tell pane4
            write text "cd ${PROJECT_ROOT}/.trees/player-weapons && clear"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "echo '   4. PLAYER & WEAPONS'"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "claude"
        end tell

        -- Go back to first session and split horizontally
        tell first session
            set pane5 to (split horizontally with default profile)
        end tell

        tell pane5
            write text "cd ${PROJECT_ROOT}/.trees/modern-ui && clear"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "echo '   5. MODERN UI/UX'"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "claude"
        end tell

        -- Split pane5 vertically for pane 6
        tell pane5
            set pane6 to (split vertically with default profile)
        end tell

        tell pane6
            write text "cd ${PROJECT_ROOT}/.trees/narrative-text && clear"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "echo '   6. NARRATIVE & LORE'"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "claude"
        end tell

        -- Split pane6 vertically for pane 7
        tell pane6
            set pane7 to (split vertically with default profile)
        end tell

        tell pane7
            write text "cd ${PROJECT_ROOT}/.trees/sound-audio && clear"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "echo '   7. SOUND & AUDIO'"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "claude"
        end tell
    end tell
end tell
EOF

echo ""
echo "✓ iTerm2 launched with 7 Claude instances!"
echo ""
echo "Iteration 2 - Specialized Agents:"
echo "  1. Controls Modernization"
echo "  2. Level Design (POIs & Symmetry)"
echo "  3. Textures & Decorations"
echo "  4. Player & Weapons System"
echo "  5. Modern UI/UX"
echo "  6. Narrative & Lore"
echo "  7. Sound & Audio"
