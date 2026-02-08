# Bani

A fully offline, cross-platform mind mapping application built with vanilla JavaScript and Electron.

![Mind Mapping Tool](https://img.shields.io/badge/mind%20mapping-tool-blue)
![ES6 Modules](https://img.shields.io/badge/architecture-modular-green)
![Electron](https://img.shields.io/badge/platform-electron-47848f)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

## Features

### Core Functionality
- ✨ **Fully Offline** - No internet connection required
- 💻 **Cross-Platform Desktop App** - Native apps for macOS, Windows, and Linux
- 🎯 **ES6 Modular Architecture** - Clean, maintainable codebase
- 📝 **Rich Text Nodes** - Support for titles and descriptions
- 🎨 **Customizable Styling** - Colors, borders, fonts, padding
- 💾 **Save/Load** - Native file dialogs with `.bani` files (JSON format)
- 📤 **Export** - Export to PNG or PDF with native save dialogs
- ⌨️ **Keyboard Shortcuts** - Fast navigation and editing
- 🖱️ **Intuitive UI** - Click, double-click, right-click interactions
- 🔍 **Zoom Controls** - Pan and zoom your mind maps
- 🌐 **Browser Support** - Also works directly in browser (no installation needed)

## Quick Start

### Option 1: Desktop App (Recommended)

#### macOS
1. Download `Bani-1.0.0-arm64.dmg` (Apple Silicon) or `Bani-1.0.0.dmg` (Intel)
2. Open the DMG file
3. Drag Bani to Applications
4. Launch Bani from Applications

#### Windows
1. Download `Bani-Setup-1.0.0.exe`
2. Run the installer
3. Launch Bani from Start Menu

#### Linux
1. Download `Bani-1.0.0.AppImage`
2. Make it executable: `chmod +x Bani-1.0.0.AppImage`
3. Run: `./Bani-1.0.0.AppImage`

### Option 2: Running in Browser

```bash
# Navigate to project directory
cd bani

# Start a local server (required for ES6 modules)
python3 -m http.server 8000

# Open in browser
open http://localhost:8000/src/index.html
```

### Option 3: Development

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build for all platforms
npm run dist
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save mind map |
| `Ctrl/Cmd + O` | Open mind map |
| `Ctrl/Cmd + N` | New mind map |
| `Ctrl/Cmd + =` | Zoom in |
| `Ctrl/Cmd + -` | Zoom out |
| `Ctrl/Cmd + 0` | Fit to screen |
| `Ctrl/Cmd + Enter` | Save description (in modal) |
| `Double-click node` | Edit node text |
| `Right-click canvas` | Add node |
| `Right-click node` | Select node |
| `Escape` | Close modals/menus |
| `Enter` | Submit inline editor |

Desktop app also includes File and View menus with export options.

## Project Structure

```
bani/
├── src/                        # Modular source code (renderer process)
│   ├── index.html             # Main HTML file
│   ├── styles/                # CSS modules
│   │   ├── variables.css      # Design system variables
│   │   ├── base.css           # Base styles
│   │   ├── header.css         # Header styles
│   │   ├── panel.css          # Node panel styles
│   │   ├── modal.css          # Modal styles
│   │   └── canvas.css         # Canvas & zoom styles
│   ├── js/                    # JavaScript modules
│   │   ├── main.js            # Application entry point
│   │   ├── config/            # Configuration modules
│   │   │   ├── constants.js   # App constants
│   │   │   └── cytoscape-config.js  # Cytoscape setup
│   │   ├── core/              # Core functionality
│   │   │   └── state.js       # State management
│   │   ├── features/          # Feature modules
│   │   │   ├── node-manager.js      # Node CRUD operations
│   │   │   ├── panel-manager.js     # Panel interactions
│   │   │   ├── inline-editor.js     # Inline text editing
│   │   │   ├── modal-manager.js     # Description modal
│   │   │   ├── file-manager.js      # Save/Load functionality
│   │   │   ├── export-manager.js    # PNG/PDF export
│   │   │   └── zoom-manager.js      # Zoom controls
│   │   └── utils/             # Utility functions
│   │       └── helpers.js
│   ├── lib/                   # External libraries (local)
│   │   ├── cytoscape.min.js
│   │   ├── html2canvas.min.js
│   │   └── jspdf.umd.min.js
│   └── img/                   # Assets
│       ├── bani.png
│       └── bani.ico
├── electron/                  # Electron main process
│   ├── main.js               # Main process entry point
│   ├── preload.js            # Preload script (secure IPC bridge)
│   └── menu.js               # Application menu
├── electron-adapter/         # Environment abstraction
│   └── file-adapter.js       # File operations (Electron/Browser)
├── build/                    # Build resources
│   ├── icons/                # Platform-specific icons
│   └── entitlements.mac.plist
├── dist/                     # Build output (gitignored)
├── bani.html                 # Legacy browser version
├── package.json              # npm/Electron configuration
├── README.md
├── LICENSE
├── CLAUDE.md
└── .gitignore
```

## Technology Stack

- **[Electron](https://www.electronjs.org/)** (v40.2.1): Cross-platform desktop framework
- **[Cytoscape.js](https://js.cytoscape.org/)** (v3.28.1): Graph visualization
- **[html2canvas](https://html2canvas.hertzen.com/)** (v1.4.1): Canvas rendering
- **[jsPDF](https://github.com/parallax/jsPDF)** (v2.5.1): PDF generation
- **ES6 Modules**: Native JavaScript modules
- **System Fonts**: Native OS fonts for offline support
- **Adapter Pattern**: Dual-mode support (Electron + Browser)

## File Format

Mind maps are saved as `.bani` files in JSON format:

```json
{
  "version": "1.0",
  "created": "2025-02-07T...",
  "viewport": {
    "zoom": 1.0,
    "pan": { "x": 0, "y": 0 }
  },
  "nodes": [...],
  "edges": [...]
}
```

## Architecture

Bani uses a **hybrid architecture** combining Electron desktop capabilities with modular ES6 code:

### Application Layers

1. **Main Process** (Electron): App lifecycle, native dialogs, file I/O
2. **Renderer Process** (Web): UI rendering, graph visualization
3. **Adapter Layer**: Environment abstraction (Electron vs Browser)
4. **Feature Modules**: Independent functionality (nodes, export, zoom)

### Code Organization

1. **Config Layer**: Constants and Cytoscape configuration
2. **Core Layer**: State management
3. **Features Layer**: Independent feature modules
4. **Utils Layer**: Shared utility functions
5. **Electron Layer**: Main process, preload, menus
6. **Adapter Layer**: File operations abstraction

### Benefits

- ✅ **Cross-platform**: Single codebase for macOS, Windows, Linux
- ✅ **Native experience**: File dialogs, menus, keyboard shortcuts
- ✅ **Backward compatible**: Browser version still works
- ✅ **Easy to extend**: Add new features without touching existing code
- ✅ **Easy to debug**: Clear module boundaries
- ✅ **Easy to test**: Each module is self-contained
- ✅ **Easy to collaborate**: Multiple developers can work on different features
- ✅ **Still offline**: All dependencies are local

### Development Workflow

```bash
# For desktop app development
npm start                    # Launch Electron app
npm run dev                  # Launch with DevTools

# For browser development
python3 -m http.server 8000  # Start local server
# Edit files in src/
# Refresh to see changes (no build needed!)

# For distribution
npm run pack                 # Test build (unbundled)
npm run dist                 # Full distribution build
npm run dist:mac             # macOS only
npm run dist:win             # Windows only
npm run dist:linux           # Linux only
```

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires ES6 module support (all modern browsers since 2018).

## Contributing

Contributions are welcome! The modular architecture makes it easy to add new features:

1. Fork the repository
2. Create a feature module in `src/js/features/`
3. Import and initialize in `src/js/main.js`
4. Test in browser
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Note**: Bani is fully offline and stores all data locally in files you save. No data is sent to any server, and no internet connection is required after downloading the repository.
