#!/bin/bash

# Launch 7 Claude instances in separate iTerm tabs (simpler than panes)

PROJECT_ROOT="/Users/bds2/Documents/kings-field-game"

osascript <<EOF
tell application "iTerm"
    activate

    create window with default profile

    tell current window
        -- Tab 1: Controls
        tell current session
            write text "cd ${PROJECT_ROOT}/.trees/modernized-controls && clear"
            write text "echo '━━━━ 1. CONTROLS MODERNIZATION ━━━━' && echo '' && claude"
        end tell

        -- Tab 2: Level Design
        create tab with default profile
        tell current session
            write text "cd ${PROJECT_ROOT}/.trees/level-design-pois && clear"
            write text "echo '━━━━ 2. LEVEL DESIGN (POIs) ━━━━' && echo '' && claude"
        end tell

        -- Tab 3: Textures
        create tab with default profile
        tell current session
            write text "cd ${PROJECT_ROOT}/.trees/textures-decorations && clear"
            write text "echo '━━━━ 3. TEXTURES & DECORATIONS ━━━━' && echo '' && claude"
        end tell

        -- Tab 4: Weapons
        create tab with default profile
        tell current session
            write text "cd ${PROJECT_ROOT}/.trees/player-weapons && clear"
            write text "echo '━━━━ 4. PLAYER & WEAPONS ━━━━' && echo '' && claude"
        end tell

        -- Tab 5: UI
        create tab with default profile
        tell current session
            write text "cd ${PROJECT_ROOT}/.trees/modern-ui && clear"
            write text "echo '━━━━ 5. MODERN UI/UX ━━━━' && echo '' && claude"
        end tell

        -- Tab 6: Narrative
        create tab with default profile
        tell current session
            write text "cd ${PROJECT_ROOT}/.trees/narrative-text && clear"
            write text "echo '━━━━ 6. NARRATIVE & LORE ━━━━' && echo '' && claude"
        end tell

        -- Tab 7: Sound
        create tab with default profile
        tell current session
            write text "cd ${PROJECT_ROOT}/.trees/sound-audio && clear"
            write text "echo '━━━━ 7. SOUND & AUDIO ━━━━' && echo '' && claude"
        end tell
    end tell
end tell
EOF

echo ""
echo "✓ 7 Claude instances launched in separate tabs!"
echo "Use Cmd+Shift+[ and Cmd+Shift+] to switch between tabs"
