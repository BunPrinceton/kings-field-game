# Kings Field - Modern Dungeon Crawler

## Quick Start

### Mac Users
```bash
./launch-game.sh
```

### Windows Users
```cmd
launch-game.bat
```

### Standalone App (Both Platforms)
```bash
# Mac
./launch-game.sh --electron

# Windows
launch-game.bat --electron
```

## Game Controls

| Key | Action |
|-----|--------|
| **S/↓** | Move Forward |
| **W/↑** | Move Backward |
| **A/←** | Strafe Left |
| **D/→** | Strafe Right |
| **SPACE** | Jump |
| **Q** | Attack |
| **F** | Fire Spell (20 Mana) |
| **E** | Interact |
| **SHIFT** | Toggle Sprint |
| **W x2** | Dash (Double Tap) |
| **ESC** | Menu/Instructions |
| **Mouse** | Look Around |

## Features

- **First-Person Dungeon Crawling** - Explore procedurally generated dungeons
- **Magic System** - Cast fire spells with mana that regenerates over time
- **Sprint & Jump** - Enhanced movement with toggle sprint and jumping
- **Simple UI** - Clean interface showing only health, mana, and sprint status
- **Rich Decoration** - Paintings and decorations throughout the dungeon
- **Combat** - Fight enemies with weapons or magic

## Building Standalone Apps

### Build for Mac
```bash
npm run dist-mac
```

### Build for Windows
```bash
npm run dist-win
```

### Build for Both
```bash
npm run dist-all
```

Built apps will appear in the `release` folder.

## Troubleshooting

### Game not starting?
- Make sure Node.js is installed (v16 or higher)
- Run `npm install` to install dependencies

### Controls not working?
- Click on the game window to capture mouse
- Press ESC to see all controls

### Performance issues?
- Try running in Chrome or Firefox
- Close other tabs/applications
- Reduce window size

## Development

### Run in Browser (Development)
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run with Electron
```bash
npm run electron
```